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

const ev_ank = process.env.EV_ANKUENDIGUNG; // Get the Discord channel ID for Gießerei event announcements
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); // Load settings from settings.json file

// Function to create the Gießerei event embed message for Discord
async function CreateFortyEmbed(guildName) {
    let prio = '🟡 Medium'; // Default priority
    let map = '/'; // Default map
    let imgLink = null; // Default image link
    let timeKey = new Date().getHours(); // Get current hour

    // Build the embed message with all required components
    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Gießerei  ${timeKey}:20`), // Title
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
            new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.fuenfundzwanzigerEVENT_VOICE), // Call link
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "), // Spacer
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKey}:10 ausgerüstet an der Event-Zone`), // Info about event time
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true), // Divider
        ).addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.OP_EV_PING_ROLE + ">"), // Footer with ping role
        );

    return [baseEmbed]; // Return as array for Discord.js
}

// Main handler function to start the Gießerei event cron job
module.exports = function startGiessereitHandler(client) {
    // Schedule the Gießerei handler to run at 14:10 every day
    cron.schedule("10 14 * * *", async () => {

        // Check if sending Gießerei event is enabled in the config table
        const [rows] = await db.execute(
            "SELECT `setconfig` FROM config WHERE config = 'send_giesserei'"
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
            // Log if sending Gießerei is not enabled
            console.log('Kein Eintrag gefunden oder das Senden der Gießerei ist deaktiviert');
        }
    });
};
