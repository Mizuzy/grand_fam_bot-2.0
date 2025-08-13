require("dotenv").config(); // Load environment variables from .env file

// Import required Discord.js builders for creating message components
const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');

const fs = require("fs"); // For reading files
const path = require("path"); // For handling file paths
const express = require('express'); // Import Express for web server
const app = express();
app.use(express.json()); // Parse JSON bodies

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Get the Discord channel ID for announcements from environment variables
const ev_ank = process.env.EV_ANKUENDIGUNG;

// Load settings from settings.json file
const settingsPath = path.resolve(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

// Function to create the announcement embed for Discord
async function CreateAnkuendigungEmbed(guildName, text) {
    let timeKey = new Date().getHours(); // Get current hour (not used here)

    // Build the embed message with title, separators, and content
    const baseEmbed = new ContainerBuilder()
        .setAccentColor(5831679)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Ankündigung für ${guildName}`), // Title
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true), // Divider
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(text), // Announcement text
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true), // Divider
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.MITGLIEDER_PING_ROLE + ">"), // Footer with ping
        );

    return [baseEmbed]; // Return as array for Discord.js
}

// Main handler function to start the announcement web server
module.exports = async function startAnkuendigungsHandler(client) {
    // Define a POST endpoint for sending announcements
    app.post('/api/announcement', async (req, res) => {
        const { text } = req.body; // Get announcement text from request body
        const channel = await client.channels.fetch(ev_ank); // Fetch the Discord channel

        // If the channel exists and is text-based, send the announcement
        if (channel && channel.isTextBased()) {
            const components = await CreateAnkuendigungEmbed(channel.guild.name, text);

            const message = await channel.send({
                components: components,
                flags: MessageFlags.IsComponentsV2,
            });

            console.log(`📢 Announcement sent to ${channel.name} in guild ${channel.guild.name}`);

            res.status(200).send('Announcement sent!');
        } else {
            // If the channel is not found or not text-based, log a warning and send error response
            console.warn('⚠️ Channel ist nicht textbasiert oder nicht gefunden');
            res.status(500).send('Channel not found');
        }
    });

    // Start the web server on port 3000
    app.listen(3000, () => console.log('Webserver running on port 3000'));
};