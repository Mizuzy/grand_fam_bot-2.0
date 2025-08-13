const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.log');



module.exports = {
    // Define the slash command structure
    data: new SlashCommandBuilder()
        .setName('addhistory')
        .setDescription('Add a history entry for a Player')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Choose an ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('entry')
                .setDescription('Choose an entry')
                .setRequired(true)
        ),
    adminOnly: true, // Only admins can use this command

    // The main command execution logic
    async execute(interaction) {

            const logLine = `[${String(new Date().getDate()).padStart(2, '0')}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${new Date().getFullYear()}] - [${String(new Date().getHours()).padStart(2, '0')}.${String(new Date().getMinutes()).padStart(2, '0')}] - ${interaction.user.tag} (${interaction.user.id}) used /${interaction.commandName} with options: ${interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join(', ')}\n`;
        
                fs.appendFile(logFilePath, logLine, (err) => {
                    if (err) {
                        onsole.error('❌ Fehler beim Schreiben in die Logdatei:', err);
                    } else {
                        console.log('✅ Log wurde erfolgreich geschrieben.');
                    }
                })  

        // Get the selected priority and map from the command options
        const p_id = interaction.options.getString('id');
        const newEntry = interaction.options.getString('entry');

        try {
            // Check if the player already exists
            const [rows] = await db.execute(
                "SELECT history FROM playerHistory WHERE p_id = ? LIMIT 1",
                [p_id]
            );

            if (rows.length > 0) {
                // Player exists, update history array
                let historyArr = [];
                try {
                    historyArr = JSON.parse(rows[0].history) || [];
                } catch (e) {
                    historyArr = [];
                }
                historyArr.push(newEntry);

                await db.execute(
                    "UPDATE playerHistory SET history = ? WHERE p_id = ?",
                    [JSON.stringify(historyArr), p_id]
                );

                await interaction.reply({
                    content: `✅ Added entry to player \`${p_id}\`'s history.`,
                    ephemeral: true,
                });
            } else {
                // Player does not exist, insert new row
                const historyArr = [newEntry];
                await db.execute(
                    "INSERT INTO playerHistory (p_id, history) VALUES (?, ?)",
                    [p_id, JSON.stringify(historyArr)]
                );

                await interaction.reply({
                    content: `✅ Created new history for player \`${p_id}\`.`,
                    ephemeral: true,
                });
            }
        } catch (err) {
            // If there is a database error, log it and inform the user
            console.error('❌ Error accessing the database:', err);
            await interaction.reply({
                content: '❌ Internal error while saving the history.',
                ephemeral: true,
            });
        }
    },
};
