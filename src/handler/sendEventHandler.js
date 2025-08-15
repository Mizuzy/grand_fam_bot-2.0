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
async function createEmbed(guildName, headerTemplate, contentTemplate, eventKey) {
    let prio = '🟡 Medium'; // Default fallback
    let map = '/';
    let imgLink = null;
    let timeKey = new Date().getHours();
    let eventId = null; // Für das spätere Reset

    try {
        // Prio und MapID aus der anderen Tabelle holen
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE Event = ? LIMIT 1",
            [eventKey]
        );
        if (rows.length > 0) {
            const event = rows[0];
            eventId = event.ID;
            if (event.Prio) prio = event.Prio;
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

    // Rückgabe: Embed und eventId für das spätere Reset
    return { embed: [baseEmbed], eventId };
}

async function prepEvent(client, event) {
    const [rows] = await db.execute(
        "SELECT `setconfig` FROM config WHERE config = 'send_" + event + "'"
    );
    if (rows.length > 0 && rows[0].setconfig === 1) {
        try {
            const channel = await client.channels.fetch(ev_ank);
            if (channel && channel.isTextBased()) {
                const [rows] = await db.execute(
                    "SELECT `header`, `content` FROM embedcontent WHERE event = ?",
                    [event]
                );
                const header = rows.length > 0 ? rows[0].header : '';
                const content = rows.length > 0 ? rows[0].content : '';
                // Event-Key für Prio: '40'
                const { embed: components, eventId } = await createEmbed(channel.guild.name, header, content, event);
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

                // Prio und MapID nach dem Senden zurücksetzen
                if (eventId) {
                    try {
                        await db.execute(
                            "UPDATE events SET Prio = '🟡 Medium', MapID = NULL WHERE ID = ?",
                            [eventId]
                        );
                    } catch (resetErr) {
                        console.error("❌ Fehler beim Zurücksetzen von Prio/MapID:", resetErr);
                    }
                }
            } else {
                console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
            }
        } catch (err) {
            console.error('❌ Fehler im ' + event + ' Cronjob:', err);
        }
    } else {
        console.log('❌ Event ' + event + ' ist nicht aktiviert oder nicht konfiguriert.');
    }
}

// Main handler function to start the 40er event cron job
module.exports = function startfortyHandler(client) {
    // 40er
    cron.schedule("30 * * * *", async () => {
        prepEvent(client, '40');
    });
    // 19:05er Bizwar
    cron.schedule("50 18 * * *", async () => {
        prepEvent(client, 'bizwar');
    });
    // 19:05er Bizwar
    cron.schedule("50 0 * * *", async () => {
        prepEvent(client, 'bizwar');
    });










    //Test
    cron.schedule("51 * * * *", async () => {
        prepEvent(client, 'bizwar');
    });

};
