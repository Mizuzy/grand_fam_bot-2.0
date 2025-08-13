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

// Function to create the 40er event embed message for Discord
async function CreateFortyEmbed(guildName) {
    let prio = '🟡 Medium'; // Default priority
    let map = '/'; // Default map
    let imgLink = null; // Default image link
    let timeKey = new Date().getHours(); // Get current hour

    try {
        // Get the current 40er event from the database
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE Event = '40' LIMIT 1"
        );

        if (rows.length > 0) {
            const event = rows[0];
            prio = event.Prio || prio;

            // If a map is set, get its name and image from the database
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

            // Reset the event's Prio and MapID after sending
            await db.execute(
                "UPDATE events SET Prio = '🟡 Medium', MapID = NULL WHERE ID = ?",
                [event.ID]
            );
        }

    } catch (err) {
        // Log any database errors
        console.error('❌ Fehler beim DB-Zugriff:', err);
    }

    // Build the embed message with all required components
    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# 40er ${timeKey}:40`), // Title
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true), // Divider
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`⚡️ **Prio**                 \`${prio}\``), // Priority
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("🔫 **Abgesägte**     ❌"), // Info line
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "), // Spacer
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.vierzigerEVENT_CALL), // Call link
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "), // Spacer
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone`), // Info about event time
        );

    // If a map and image are available, add them to the embed
    if (map !== '/' && imgLink) {
        baseEmbed
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`🖼️ **Map**               \`${map}\``), // Map name
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(imgLink) // Map image
                )
            );
    }

    // Add a footer with bot info and ping role
    baseEmbed.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    ).addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.EV_PING_ROLE + ">"),
    );

    return [baseEmbed]; // Return as array for Discord.js
}

// Main handler function to start the 40er event cron job
module.exports = function startfortyHandler(client) {
    // Schedule the 40er handler to run at minute 30 of every hour
    cron.schedule("30 * * * *", async () => {

        // Check if sending 40er event is enabled in the config table
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_forty'"
        );

        // If enabled, send the event message
        if (rows.length > 0 && rows[0].setconfig === 1) {
            try {
                // Fetch the Discord channel
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    // Create the embed and send the message
                    const components = await CreateFortyEmbed(channel.guild.name);

                    const message = await channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                    });

                    // Delete the message after 20 minutes
                    setTimeout(async () => {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            console.error("❌ Fehler beim Löschen der Nachricht:", deleteErr);
                        }
                    }, 1200 * 1000);

                } else {
                    // Warn if the channel is not found or not text-based
                    console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
                }
            } catch (err) {
                // Log any errors during the cron job
                console.error('❌ Fehler im Bizwar Cronjob:', err);
            }

        } else {
            // Log if sending 40er is not enabled
            console.log('Kein Eintrag gefunden');
        }
    });
};
