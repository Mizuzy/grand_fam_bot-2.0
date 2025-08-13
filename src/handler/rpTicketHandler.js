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

const ev_ank = process.env.EV_ANKUENDIGUNG; // Get the Discord channel ID for RPTicket event announcements
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); // Load settings from settings.json file

// Function to create the RPTicket event embed message for Discord
async function CreateFortyEmbed(guildName) {
    let prio = '🔴 High'; // Default priority
    let map = '/'; // Default map
    let imgLink = null; // Default image link
    let timeKey = new Date().getHours(); // Get current hour

    // Build the embed message with all required components
    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# RPTicket Farbrik ${timeKey}:30`), // Title
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true), // Divider
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`⚡️ **Prio**                 \`${prio}\``), // Priority
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("🔫 **Abgesägte**     ✅"), // Info line
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
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKey}:20 ausgerüstet an der Event-Zone`), // Info about event time
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true), // Divider
        ).addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.EV_PING_ROLE + ">"), // Footer with ping role
        );

    return [baseEmbed]; // Return as array for Discord.js
}

// Main handler function to start the RPTicket event cron jobs
module.exports = function startRpTicketwarHandler(client) {
    // Schedule the RPTicket handler to run at 10:20, 16:20, and 22:30 every day
    cron.schedule("20 10 * * *", async () => {
        await handleRPTicket(client);
    });
    cron.schedule("20 16 * * *", async () => {
        await handleRPTicket(client);
    });
    cron.schedule("30 22 * * *", async () => {
        await handleRPTicket(client);
    });

    // Function that sends the RPTicket message if enabled in the config
    async function handleRPTicket(client) {
        // Check if sending RPTicket is enabled in the config table
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_RPTicket'"
        );

        if (rows.length > 0 && String(rows[0].setconfig) === '1') {
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
            // Log if sending RPTicket is not enabled
            console.log('Kein Eintrag gefunden oder send_RPTicket ist nicht 1');
        }
    }

};
