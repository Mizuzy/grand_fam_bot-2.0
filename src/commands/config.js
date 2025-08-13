const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.log');


// List of available config options for the command
const configs = [
    { name: 'send_forty', value: 'send_forty' },
    { name: 'send_bizwar', value: 'send_bizwar' },
    { name: 'send_RPTicket', value: 'send_RPTicket' },
    { name: 'send_waffenfabrik', value: 'send_waffenfabrik' },
    { name: 'send_giesserei', value: 'send_giesserei' },
    { name: 'send_cayo', value: 'send_cayo' },
    { name: 'send_ekz', value: 'send_ekz' },
    { name: 'send_hotel', value: 'send_hotel' },
    { name: 'send_weinberge', value: 'send_weinberge' },
];

// Possible values for each config (0 = off, 1 = on)
const values = [
    { name: '0', value: '0' },
    { name: '1', value: '1' },
];

module.exports = {
    // Define the slash command structure
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Sets map and/or prio for Forty')
        .addStringOption(option =>
            option.setName('config')
                .setDescription('Choose the config (e.g. Map)')
                .setRequired(true)
                .addChoices(...configs)
        )
        .addStringOption(option =>
            option.setName('wert')
                .setDescription('Choose the value (0/1)')
                .setRequired(true)
                .addChoices(...values)
        ),
    adminOnly: true, // Only admins can use this command

    // Main command execution logic
    async execute(interaction) {

            const logLine = `[${String(new Date().getDate()).padStart(2, '0')}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${new Date().getFullYear()}] - [${String(new Date().getHours()).padStart(2, '0')}.${String(new Date().getMinutes()).padStart(2, '0')}] - ${interaction.user.tag} (${interaction.user.id}) used /${interaction.commandName} with options: ${interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join(', ')}\n`;
        
                fs.appendFile(logFilePath, logLine, (err) => {
                    if (err) {
                        onsole.error('❌ Fehler beim Schreiben in die Logdatei:', err);
                    } else {
                        console.log('✅ Log wurde erfolgreich geschrieben.');
                    }
                })  

        // Get the selected config and value from the command options
        const selectedConfig = interaction.options.getString('config');
        const selectedValue = interaction.options.getString('wert');

        // If neither option is provided, reply with a warning
        if (!selectedConfig && !selectedValue) {
            return await interaction.reply({
                content: '⚠️ Please select at least one option (`config` or `wert`).',
                ephemeral: true,
            });
        }

        try {
            // If both config and value are provided, update the database
            if (selectedConfig && selectedValue) {
                const intValue = parseInt(selectedValue, 10);

                // Update the config entry in the database
                await db.execute(
                    "UPDATE config SET setconfig = ? WHERE config = ?",
                    [intValue, selectedConfig]
                );
            }

            // Reply to the user confirming the data was saved
            await interaction.reply({
                content:
                    `✅ Data for **40er** saved:` +
                    (selectedConfig ? `\n🗺️ Config: \`${selectedConfig}\`` : '') +
                    (selectedValue ? `\n⚠️ Value: \`${selectedValue}\`` : ''),
                ephemeral: true,
            });

        } catch (err) {
            // If there is a database error, log it and inform the user
            console.error('❌ Error accessing the database:', err);
            await interaction.reply({
                content: '❌ Internal error while saving the data.',
                ephemeral: true,
            });
        }
    },
};
