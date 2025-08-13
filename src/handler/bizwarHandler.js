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

// Get the Discord channel ID for Bizwar announcements from environment variables
const ev_ank = process.env.EV_ANKUENDIGUNG;

// Load settings from settings.json file
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

// Function to create the Bizwar embed message for Discord
async function CreateBizEmbed(guildName) {
    // Default values
    let prio = '🟡 Medium';
    let map = '/';
    let imgLink = null;
    // Set time keys based on current hour
    let timeKey = new Date().getHours() === 18 ? "19:05" : new Date().getHours() === 0 ? "01:05" : "???";
    let timeKeyTwo = new Date().getHours() === 18 ? "18:50" : new Date().getHours() === 0 ? "00:50" : "???";

    try {
        // Get the current Bizwar event from the database
        const [rows] = await db.execute(
            "SELECT * FROM events WHERE Event = 'BIZWAR' LIMIT 1"
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
                "UPDATE events SET Prio = NULL, MapID = NULL WHERE ID = ?",
                [event.ID]
            );
        }

    } catch (err) {
        // Log any database errors
        console.error('❌ Error accessing the database:', err);
    }

    // Build the embed message with all required components
    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Bizwar ${timeKey}`), // Title
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
            new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.WARTEHALLE_CALL), // Call link
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "), // Spacer
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKeyTwo} ausgerüstet an der Event-Zone`), // Info about event time
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

// Main handler function to start the Bizwar cron jobs
module.exports = function startBizwarHandler(client) {
    // Schedule the Bizwar handler to run at 18:50 and 00:50 every day
    cron.schedule("50 18 * * *", async () => {
        await handleBizwar(client);
    });
    cron.schedule("50 0 * * *", async () => {
        await handleBizwar(client);
    });

    // Function that sends the Bizwar message if enabled in the config
    async function handleBizwar(client) {
        // Check if sending Bizwar is enabled in the config table
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_bizwar'"
        );

        if (rows.length > 0 && String(rows[0].setconfig) === '1') {
            try {
                // Fetch the Discord channel
                const channel = await client.channels.fetch(ev_ank);
                if (channel && channel.isTextBased()) {
                    // Create the embed and send the message
                    const components = await CreateBizEmbed(channel.guild.name);

                    const message = await channel.send({
                        components: components,
                        flags: MessageFlags.IsComponentsV2,
                    });

                    // Delete the message after 20 minutes
                    setTimeout(async () => {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            console.error("❌ Error deleting the message:", deleteErr);
                        }
                    }, 1200 * 1000);

                } else {
                    // Warn if the channel is not found or not text-based
                    console.warn('⚠️ Channel is not text-based or not found');
                }
            } catch (err) {
                // Log any errors during the cron job
                console.error('❌ Error in Bizwar cron job:', err);
            }
        } else {
            // Log if sending Bizwar is not enabled
            console.log('No entry found or send_bizwar is not 1');
        }
    }


};

