const {
    SlashCommandBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');

const fs = require("fs");
const db = require('../utils/mysql');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Ein Test-Command mit Component!'),
    adminOnly: true,

  async execute(interaction) {
    const channel = interaction.channel;

    const guildName = interaction.guild?.name;

    const fs = require("fs");
    const path = require("path");

    const ev_ank = process.env.EV_ANKUENDIGUNG;
    const settingsPath = path.resolve(__dirname, '../settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));



      async function CreateBizEmbed(guildName) {
          let prio = '🟡 Medium';
          let map = '/';
          let imgLink = null;
          let timeKey = new Date().getHours();

          try {
              const [rows] = await db.execute(
                  "SELECT * FROM events WHERE Event = '40' LIMIT 1"
              );

              if (rows.length > 0) {
                  const event = rows[0];
                  prio = event.Prio || prio;

                  if (event.MapID) {
                      const [mapRows] = await db.execute(
                          "SELECT MAP, IMG FROM maps WHERE ID = ? LIMIT 1",
                          [event.MapID]
                      );

                      if (mapRows.length > 0) {
                          map = mapRows[0].MAP;
                          imgLink = mapRows[0].IMG;
                      }
                  }

                  // Reset nach Erstellung
                  await db.execute(
                      "UPDATE events SET Prio = '🟡 Medium', MapID = NULL WHERE ID = ?",
                      [event.ID]
                  );

              }

          } catch (err) {
              console.error('❌ Fehler beim DB-Zugriff:', err);
          }

          const baseEmbed = new ContainerBuilder()
              .setAccentColor(5831679)
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# 40er ${timeKey}:40`),
              )
              .addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
              )
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`⚡️ **Prio**                 \`${prio}\``),
              )
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent("🔫 **Abgesägte**     ❌"),
              )
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent("-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
              )
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent("📞 **Call**                https://discord.com/channels/1397954631883161630/" + process.env.vierzigerEVENT_CALL),
              )
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent("-# ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ "),
              )
              .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone`),
              )



          if (map !== '/' && imgLink) {
              baseEmbed
                  .addSeparatorComponents(
                      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                  )
                  .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(`🖼️ **Map**               \`${map}\``),
                  )
                  .addSeparatorComponents(
                      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                  )
                  .addMediaGalleryComponents(
                      new MediaGalleryBuilder().addItems(
                          new MediaGalleryItemBuilder().setURL(imgLink)
                      )
                  );
          }

          baseEmbed.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
          ).addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`-# ${guildName}︲Bot by Cavara︲` + "<@&" + process.env.EV_PING_ROLE + ">"),
          );

          return [baseEmbed];
      }



      const components = await CreateBizEmbed(channel.guild.name);
      await channel.send({
        components: components,
        flags: MessageFlags.IsComponentsV2,
      });
      return interaction.reply({
          content: '✅ Richtlinien-Komponente erfolgreich gesendet.',
          flags: MessageFlags.Ephemeral
      });


  },
};
