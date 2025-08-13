const fs = require('fs'); // For reading files and directories
const path = require('path'); // For handling file paths
const { REST, Routes } = require('discord.js'); // Discord.js REST API and route helpers
require('dotenv').config(); // Load environment variables from .env file

module.exports = (client) => {
  const commands = []; // Array to store command data for registration
  // Read all .js files from the commands directory
  const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter(file => file.endsWith('.js'));

  // Loop through each command file
  for (const file of commandFiles) {
    const command = require(`../commands/${file}`); // Import the command module
    // Check if the command has both 'data' and 'execute' properties
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command); // Add the command to the client's command collection
      commands.push(command.data.toJSON()); // Add the command's data for registration
    } else {
      // Warn if the command file does not have the correct format
      console.warn(`[WARN] The file ${file} does not have a valid command format.`);
    }
  }

  // Create a REST client for Discord API using the bot token
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  // Register the slash commands with Discord using an async IIFE
  (async () => {
    try {
      console.log('🔃 Registering slash commands...');

      // Register commands for the specified guild
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );

      console.log('✅ Slash commands registered!');
    } catch (error) {
      // Log any errors during registration
      console.error('❌ Error registering commands:', error);
    }
  })();
};
