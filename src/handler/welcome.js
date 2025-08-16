// handler/welcome.js
require("dotenv").config();

const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');
const db = require('../utils/mysql');

// --- Button-ID (einmal zentral definiert) ---
const BUTTON_ID = '2996c20240ef4c7d88d0efbd62a1bbf9';

// -------------------------------
// Embed-Builder für die DM
// -------------------------------
async function createEmbed(guildName) {
    const components = [
        new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Web Panel - Account Erstellung"),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("Klicke auf „Account erstellen“, um einen Web-Panel-Account zu erstellen."),
            )
            .addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Account erstellen")
                            .setEmoji({ name: "👤" })
                            .setCustomId(BUTTON_ID),
                    ),
            ),
    ];

    return components;
}

// -------------------------------
// Handle DM bei Member Join
// -------------------------------
async function handleWelcome(client, member) {
    try {
        const components = await createEmbed(member.guild.name);

        await member.send({
            components: components,
            // Flags für Komponenten-Message (IsComponentsV2 ist korrekt für component-only DMs)
            flags: MessageFlags.IsComponentsV2,
        });

        console.log(`DM an ${member.user.tag} erfolgreich geschickt.`);
    } catch (err) {
        console.error(`Konnte keine DM an ${member.user.tag} schicken:`, err.message);
    }
}

// -------------------------------
// Button-Handler: wird vom index.js über buttonHandlers[...] verwendet.
// Wir exportieren handleWelcome als `module.exports`, und hängen folgende Props an.
// -------------------------------
handleWelcome.customId = BUTTON_ID;
handleWelcome.type = 'button';

handleWelcome.execute = async function(interaction) {
    try {
        console.log(`Button geklickt von: ${interaction.user.username}`);

        // Beispielantwort (ephemeral über flags)
        await interaction.reply({
            content: `Hey ${interaction.user.username}, dein Klick wurde registriert ✅`,
            flags: MessageFlags.Ephemeral
        });

        // optional: weitere Logik hier (DB Eintrag, Modal öffnen, etc.)
    } catch (err) {
        console.error('Fehler im welcomeButton execute:', err);
        if (!interaction.replied && !interaction.deferred) {
            // fallback reply
            interaction.reply({ content: '❌ Interner Fehler beim Button-Handler.', flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
};

// -------------------------------
// MySQL Helper (falls du ihn noch brauchst)
// -------------------------------
handleWelcome.addEntry = function(user, pww, ICID) {
    return db.execute(
        "INSERT INTO user (user, pww, ICID) VALUES (?, ?, ?)",
        [user, pww, ICID]
    );
};

// Export: die Funktion selbst (mit properties attached)
module.exports = handleWelcome;
