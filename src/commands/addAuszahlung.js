const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.log');



module.exports = {
    // Define the slash command structure
    data: new SlashCommandBuilder()
        .setName('addauszahlung')
        .setDescription('Add a Auszahlungs entry for a Player')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Choose an ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Choose an entry')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ammount')
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
        const event = interaction.options.getString('event');
        const ammount = interaction.options.getString('ammount');
        const userId = interaction.user.id;
        try {
            
                // Player does not exist, insert new row
                await db.execute(
                    "INSERT INTO auszahlung (ICID, event, ammount, DCID) VALUES (?, ?, ?, ?)",
                    [p_id, event, ammount, await getDCID(p_id)]
                );

                await interaction.reply({
                    content: `✅ Created new Auszahlung for player \`${p_id}\`.`,
                    ephemeral: true,
                });
            
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

async function getDCID(p_id) {

const [rows] = await db.execute(
    'SELECT DCID FROM user WHERE ICID = ?',
    [p_id]
                );

  if (rows.length > 0) {
    return rows[0].DCID;
  } else {
    return null; 
  }
}
