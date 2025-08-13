const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/mysql');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/logs.log');


// Define available priority choices for the command
const prioChoices = [
    { name: '🟢 Low', value: '🟢 Low' },
    { name: '🟡 Medium', value: '🟡 Medium' },
    { name: '🔴 High', value: '🔴 High' },
];

// Define available map choices for the command
const dummyMaps = [
    { name: 'Feuerwehr', value: 'Feuerwehr' },
    { name: 'Öl Felder', value: 'Öl Felder' },
    { name: 'Windkrafft', value: 'Windkrafft' },
    { name: 'Hafen', value: 'Hafen' },
    { name: 'Theater', value: 'Theater' },
    { name: 'Tittenberger', value: 'Tittenberger' },
    { name: 'Famwar', value: 'Famwar' },
    { name: 'Filmstudios', value: 'Filmstudios' },
    { name: 'Flugzeugfriedhof', value: 'Flugzeugfriedhof' },
    { name: 'E-Werke', value: 'E-Werke' },
    { name: 'Baustelle', value: 'Baustelle' },
];

module.exports = {
    // Define the slash command structure for Discord
    data: new SlashCommandBuilder()
        .setName('forty_config')
        .setDescription('Sets map and/or priority for Forty')
        .addStringOption(option =>
            option.setName('prio')
                .setDescription('Choose the match priority')
                .setRequired(false)
                .addChoices(...prioChoices)
        )
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Name of the map (must exist for 40er in DB)')
                .setRequired(false)
                .addChoices(...dummyMaps)
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

            // If a map is provided, check if it exists in the database for event '40'
            if (mapName) {
                const [mapRows] = await db.execute(
                    "SELECT ID FROM maps WHERE MAP = ? AND event = '40' LIMIT 1",
                    [mapName]
                );

                // If the map doesn't exist, reply with an error
                if (mapRows.length === 0) {
                    return await interaction.reply({
                        content: `❌ The map \`${mapName}\` does not exist or is not registered for 40er.`,
                        ephemeral: true,
                    });
                }

                // Store the map ID for later use
                mapID = mapRows[0].ID;
            }

            // Check if there is already an event entry for '40'
            const [rows] = await db.execute("SELECT ID, Prio, MapID FROM events WHERE Event = '40' LIMIT 1");

            if (rows.length > 0) {
                // If an entry exists, update it if there are changes
                const current = rows[0];
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
                    "UPDATE events SET Prio = ?, MapID = ? WHERE Event = '40'",
                    [newPrio, newMapID]
                );
            } else {
                // If no entry exists, insert a new one
                await db.execute(
                    "INSERT INTO events (Event, Prio, MapID) VALUES ('40', ?, ?)",
                    [prio ?? null, mapID ?? null]
                );
            }

            // Reply to the user confirming the data was saved
            await interaction.reply({
                content: `✅ Data for **40er** saved:` +
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
