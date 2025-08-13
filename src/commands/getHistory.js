const {
    SlashCommandBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags
} = require('discord.js');
const db = require("../utils/mysql");
const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../../logs/logs.log");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gethistory")
    .setDescription("Get the history of a player")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Player ID to retrieve history for")
        .setRequired(true)
    ),
  adminOnly: true, // Nur Admins dürfen den Command benutzen

  async execute(interaction) {
    const logLine = `[${String(new Date().getDate()).padStart(2, "0")}.${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}.${new Date().getFullYear()}] - [${String(
      new Date().getHours()
    ).padStart(2, "0")}.${String(new Date().getMinutes()).padStart(
      2,
      "0"
    )}] - ${interaction.user.tag} (${interaction.user.id}) used /${
      interaction.commandName
    } with options: ${interaction.options.data
      .map((opt) => `${opt.name}: ${opt.value}`)
      .join(", ")}\n`;

    fs.appendFile(logFilePath, logLine, (err) => {
      if (err) {
        onsole.error("❌ Fehler beim Schreiben in die Logdatei:", err);
      } else {
        console.log("✅ Log wurde erfolgreich geschrieben.");
      }
    });

    const p_id = interaction.options.getString("id");

    try {
      // Abfrage der History aus der Datenbank
      const [rows] = await db.execute(
        "SELECT history FROM playerHistory WHERE p_id = ? LIMIT 1",
        [p_id]
      );

      if (rows.length > 0) {
        let historyArr = [];
        try {
          historyArr = JSON.parse(rows[0].history) || [];
        } catch (e) {
          historyArr = [];
        }

        if (historyArr.length === 0) {
          await interaction.reply({
            content: `ℹ️ Die History für Spieler \`${p_id}\` ist leer.`,
            ephemeral: true,
          });
        } else {
          // Ausgabe der History als Liste
          const formattedHistory = historyArr
            .map((entry, index) => `${index + 1}. ${entry}`)
            .join("\n");

          const components = [
            new ContainerBuilder()
                .setAccentColor(5831679)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `📜 **History von \`${p_id}\`**:`
                )
              )
              .addSeparatorComponents(
                new SeparatorBuilder()
                  .setSpacing(SeparatorSpacingSize.Small)
                  .setDivider(true)
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${formattedHistory}`)
              ),
          ];
          await interaction.reply({
            components: components,
            flags: MessageFlags.IsComponentsV2,
            ephemeral: true,
          });
          /*await interaction.reply({
            content: `📜 **History von \`${p_id}\`**:\n${formattedHistory}`,
            ephemeral: true,
          });*/
        }
      } else {
        await interaction.reply({
          content: `⚠️ Kein Eintrag für Spieler \`${p_id}\` gefunden.`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error("❌ Fehler beim Abrufen der History:", err);
      await interaction.reply({
        content: "❌ Interner Fehler beim Abrufen der History.",
        ephemeral: true,
      });
    }
  },
};
