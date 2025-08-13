const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.log');


// Define choices for priority and dummy map options
const prioChoices = [
    { name: '🟢 Low', value: '🟢 Low' },
    { name: '🟡 Medium', value: '🟡 Medium' },
    { name: '🔴 High', value: '🔴 High' },
];

const dummyMaps = [
    { name: 'Hafen', value: 'Hafen' },
];

module.exports = {
    // Define the slash command structure
    data: new SlashCommandBuilder()
        .setName('bizconfig')
        .setDescription('Set map and/or priority for BIZWAR')
        .addStringOption(option =>
            option.setName('prio')
                .setDescription('Choose the match priority')
                .setRequired(false)
                .addChoices(...prioChoices)
        )
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Name of the map (must exist for Bizwar in DB)')
                .setRequired(false)
                .addChoices(...dummyMaps)
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
        const prio = interaction.options.getString('prio');
        const mapName = interaction.options.getString('map');
        let mapID = null;

        try {
            // If neither option is provided, reply with a warning
            if (!prio && !mapName) {
                return await interaction.reply({
                    content: '⚠️ Please provide at least one option (`map` or `prio`).',
                    ephemeral: true,
                });
            }

            // If a map is provided, check if it exists in the database for Bizwar
            if (mapName) {
                const [mapRows] = await db.execute(
                    "SELECT ID FROM maps WHERE MAP = ? AND event = 'bizwar' LIMIT 1",
                    [mapName]
                );

                // If the map doesn't exist, reply with an error
                if (mapRows.length === 0) {
                    return await interaction.reply({
                        content: `❌ The map \`${mapName}\` does not exist or is not registered for Bizwar.`,
                        ephemeral: true,
                    });
                }

                // Store the map ID for later use
                mapID = mapRows[0].ID;
            }

            // Check if there is already an event entry for BIZWAR
            const [rows] = await db.execute("SELECT ID, Prio, MapID FROM events WHERE Event = 'BIZWAR' LIMIT 1");

            if (rows.length > 0) {
                // If an entry exists, update it if there are changes
                const current = rows[0];

                // Use the new values if provided, otherwise keep the current ones
                const newPrio = prio ?? current.Prio;
                const newMapID = mapID ?? current.MapID;

                // If nothing has changed, inform the user
                if (current.Prio === newPrio && current.MapID == newMapID) {
                    return await interaction.reply({
                        content: `ℹ️ The entered data is already saved:\n🗺️ MapID: \`${newMapID}\`\n⚠️ Prio: \`${newPrio}\``,
                        ephemeral: true,
                    });
                }

                // Update the event entry with new values
                await db.execute(
                    "UPDATE events SET Prio = ?, MapID = ? WHERE Event = 'BIZWAR'",
                    [newPrio, newMapID]
                );
            } else {
                // If no entry exists, insert a new one
                await db.execute(
                    "INSERT INTO events (Event, Prio, MapID) VALUES ('BIZWAR', ?, ?)",
                    [prio ?? null, mapID ?? null]
                );
            }

            // Reply to the user confirming the data was saved
            await interaction.reply({
                content: `✅ Data for **BIZWAR** saved:` +
                    (mapID !== null ? `\n🗺️ MapID: \`${mapID}\`` : '') +
                    (prio ? `\n⚠️ Prio: \`${prio}\`` : ''),
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
