require("dotenv").config(); // Load environment variables from .env file

// Import required Discord.js builders for creating message components
const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder
} = require('discord.js');
const db = require('../utils/mysql'); // Import MySQL database utility
const cron = require("node-cron"); // Import node-cron for scheduling tasks
const fs = require("fs"); // For reading files
const path = require("path"); // For handling file paths

const ev_ank = process.env.EV_ANKUENDIGUNG; // Get the Discord channel ID for 40er event announcements
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); // Load settings from settings.json file

// Funktion zum Erstellen des Embeds, jetzt mit eventKey als Parameter
async function CreateFortyEmbed(guildName, headerTemplate, contentTemplate, eventKey) {
    let prio = '🟡 Medium'; // Default fallback
    let map = '/';
    let imgLink = null;
    let timeKey = new Date().getHours();

    try {
        // Prio aus der anderen Tabelle holen
        const [prioRows] = await db.execute(
            "SELECT Prio FROM events WHERE Event = ? LIMIT 1",
            [eventKey]
        );
        if (prioRows.length > 0 && prioRows[0].Prio) {
            prio = prioRows[0].Prio;
        }

        // Map wie gehabt (optional, falls du das brauchst)
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE Event = ? LIMIT 1",
            [eventKey]
        );
        if (rows.length > 0) {
            const event = rows[0];
            // MapID Handling wie gehabt
            if (event.MapID) {
                const [mapRows] = await db.execute(
                    "SELECT MAP, IMG FROM maps WHERE ID = ? LIMIT 1",
                    [event.MapID]
                );
                if (mapRows.length > 0) {
                    map = mapRows[0].MAP;
                    imgLink = mapRows[0].IMG;
                }
            }
            // Reset MapID/Prio falls gewünscht (optional)
            // await db.execute(
            //     "UPDATE events SET Prio = '🟡 Medium', MapID = NULL WHERE ID = ?",
            //     [event.ID]
            // );
        }
    } catch (err) {
        console.error('❌ Fehler beim DB-Zugriff:', err);
    }

    // Template-Strings dynamisch auswerten:
    let header = '';
    let content = '';
    try {
        // eslint-disable-next-line no-new-func
        header = new Function('prio', 'timeKey', 'process', `return \`${headerTemplate}\`;`)(prio, timeKey, process);
    } catch (err) {
        header = "Fehler beim Auswerten des Headers!";
        console.error('❌ Fehler beim Auswerten des Headers:', err);
    }
    try {
        // eslint-disable-next-line no-new-func
        content = new Function('prio', 'timeKey', 'process', `return \`${contentTemplate}\`;`)(prio, timeKey, process);
    } catch (err) {
        content = "Fehler beim Auswerten des Contents!";
        console.error('❌ Fehler beim Auswerten des Contents:', err);
    }

    // Build the embed message with all required components
    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(header),
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(content),
        );

    // If a map and image are available, add them to the embed
    if (map !== '/' && imgLink) {
        baseEmbed
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🖼️ **Map**               \`${map}\``),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(imgLink)
                )
            );
    }

    // Add a footer with bot info and ping role
    baseEmbed.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    ).addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.EV_PING_ROLE + ">"),
    );

    return [baseEmbed];
}

// Main handler function to start the 40er event cron job
module.exports = function startfortyHandler(client) {
    // 40er
    cron.schedule("30 * * * *", async () => {
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_forty'"
        );
        if (rows.length > 0 && rows[0].setconfig === 1) {
            try {
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    const [rows] = await db.execute(
                        "SELECT `header`, `content` FROM embedcontent WHERE ID = 1"
                    );
                    const header = rows.length > 0 ? rows[0].header : '';
                    const content = rows.length > 0 ? rows[0].content : '';
                    // Event-Key für Prio: '40'
                    const components = await CreateFortyEmbed(channel.guild.name, header, content, '40');
                    const message = await channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                    });
                    setTimeout(async () => {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            console.error("❌ Fehler beim Löschen der Nachricht:", deleteErr);
                        }
                    }, 1200 * 1000);
                } else {
                    console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
                }
            } catch (err) {
                console.error('❌ Fehler im 40 Cronjob:', err);
            }
        } else {
            console.log('Kein Eintrag gefunden');
        }
    });

    // BIZWAR 19:05
    cron.schedule("50 18 * * *", async () => {
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_bizwar'"
        );
        if (rows.length > 0 && rows[0].setconfig === 1) {
            try {
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    const [rows] = await db.execute(
                        "SELECT `header`, `content` FROM embedcontent WHERE ID = 2"
                    );
                    const header = rows.length > 0 ? rows[0].header : '';
                    const content = rows.length > 0 ? rows[0].content : '';
                    // Event-Key für Prio: 'BiZWAR'
                    const components = await CreateFortyEmbed(channel.guild.name, header, content, 'BiZWAR');
                    const message = await channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                    });
                    setTimeout(async () => {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            console.error("❌ Fehler beim Löschen der Nachricht:", deleteErr);
                        }
                    }, 1200 * 1000);
                } else {
                    console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
                }
            } catch (err) {
                console.error('❌ Fehler im bizwar Cronjob:', err);
            }
        } else {
            console.log('Kein Eintrag gefunden');
        }
    });
// BIZWAR 01:05
    cron.schedule("50 0 * * *", async () => {
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_bizwar'"
        );
        if (rows.length > 0 && rows[0].setconfig === 1) {
            try {
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    const [rows] = await db.execute(
                        "SELECT `header`, `content` FROM embedcontent WHERE ID = 2"
                    );
                    const header = rows.length > 0 ? rows[0].header : '';
                    const content = rows.length > 0 ? rows[0].content : '';
                    // Event-Key für Prio: 'BiZWAR'
                    const components = await CreateFortyEmbed(channel.guild.name, header, content, 'BiZWAR');
                    const message = await channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                    });
                    setTimeout(async () => {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            console.error("❌ Fehler beim Löschen der Nachricht:", deleteErr);
                        }
                    }, 1200 * 1000);
                } else {
                    console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
                }
            } catch (err) {
                console.error('❌ Fehler im bizwar Cronjob:', err);
            }
        } else {
            console.log('Kein Eintrag gefunden');
        }
    });
};
