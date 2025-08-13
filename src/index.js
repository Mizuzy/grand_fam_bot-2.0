require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const path = require('path');

// Bot-Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ]
});

// ----------- Handler-Importe ---------------
const startBizwarHandler = require('./handler/bizwarHandler');
const startfortyHandler = require('./handler/fortyHandler');
const startRpTicketHandler = require('./handler/rpTicketHandler');
const startWaffenfabrikHandler = require('./handler/waffenfabrikHandler');
const startGiessereitHandler = require('./handler/giessereiHandler.js');
const startCayoHandler = require('./handler/cayoHandler.js');
const startEkzHandler = require('./handler/ekzHandler.js');
const startHotelHandler = require('./handler/hotelHandler.js');
const startWeinbergeHandler = require('./handler/weinbergeHandler.js');
const startAnkuendigungsHandler = require('./handler/ankuendigungHandler.js');
const startFiftyHandler = require('./handler/fiftyHandler.js');

// Weitere Handler manuell hier hinzufügen...

const buttonHandlers = {
  //'8a1cb8ce686a4cd2e56d29e9d005edfd': verifizierenButton,
};

const selectMenuHandlers = {
  // Beispiel: 'faq_select': require('./handler/faqSelect'),
};

const modalHandlers = {
  //'support_anfrage_modal': supportAnfrageModalHandler,
};

// ----------- Command-Importe ---------------
const testCommand = require('./commands/test.js');
const bizConfigCommand = require('./commands/bizconfig.js');
const fortyConfigCommand = require('./commands/fortyconfig.js');
const configCommand = require('./commands/config.js');
const fiftyConfigCommand = require('./commands/fiftyConfig.js');
const addHistoryCommand = require('./commands/addHistory.js');
const getHistoryCommand = require('./commands/getHistory.js');


// Weitere Commands manuell hier hinzufügen...

const commandList = [
  testCommand.data,
  bizConfigCommand.data,
  fortyConfigCommand.data,
  configCommand.data,
  fiftyConfigCommand.data,
  addHistoryCommand.data,
  getHistoryCommand.data,
];

const commandMap = {
  'test': testCommand,
  'bizconfig': bizConfigCommand,
  'forty_config': fortyConfigCommand,
  'config': configCommand,
  'fifty_config': fiftyConfigCommand,
  'addhistory': addHistoryCommand,
  'gethistory': getHistoryCommand,

};

// ----------- SlashCommand Registration -----------
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Registriere Slash-Commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandList }
    );
    console.log('✅ Slash-Commands registriert!');
  } catch (err) {
    console.error('❌ Fehler beim Registrieren:', err);
  }
})();

// ----------- Permission Check -----------
function checkPermissions(interaction, command) {
  if (!interaction.inGuild()) return false;
  if (command && command.adminOnly) {
    const permissionRoles = process.env.PERMISSION_ROLES?.split(',') ?? [];
    if (interaction.member.permissions.has('Administrator')) return true;
    return interaction.member.roles.cache.some(role => permissionRoles.includes(role.id));
  }
  return true;
}

// ----------- Status-Rotator -----------
client.once('ready', async () => {
  console.log(`✅ Bot online als ${client.user.tag}`);

  console.log('Events: ');
  
  startBizwarHandler(client);
  console.log('Bizwarhandler gestartet');
  startfortyHandler(client);
  console.log('FortyHandler gestartet');
  startRpTicketHandler(client);
  console.log('rpTicketHandler gestartet');
  startWaffenfabrikHandler(client);
  console.log('WaffenfabrikHandler gestartet');
  startGiessereitHandler(client);
  console.log('GiessereitHandler gestartet');
  startCayoHandler(client);
  console.log('CayoHandler gestartet');
  startEkzHandler(client);
  console.log('EkzHandler gestartet');
  startHotelHandler(client);
  console.log('HotelHandler gestartet');
  startWeinbergeHandler(client);
  console.log('WeinbergeHandler gestartet');
  startFiftyHandler(client);
  console.log('FiftyHandler gestartet');

  console.log(' ');
  console.log('Rest: ')
  startAnkuendigungsHandler(client);
  console.log('AnkuendigungsHandler gestartet');


  const activities = [
    { name: '⚜ Grand RP' },
    { name: '🔗 .gg/cavarahub' },
    { name: '📦 Sponsored By CavaraHUB' },
    { name: '😊 1234 Member' },
  ];
  let i = 0;

  setInterval(() => {
    const activity = activities[i];
    client.user.setPresence({
      activities: [{ name: activity.name, type: 4 }],
      status: 'dnd',
      afk: false,
    });
    i = (i + 1) % activities.length;
  }, 5000);
});

// ----------- Interaction Handler -----------
client.on('interactionCreate', async interaction => {
    try {
      if (interaction.isChatInputCommand()) {
        console.log(`📥 SlashCommand: /${interaction.commandName} von ${interaction.user.tag}`);
        
        const command = commandMap[interaction.commandName];
        if (!command) return interaction.reply({ content: '❌ Unbekannter Befehl.', ephemeral: true });
        if (!checkPermissions(interaction, command)) {
          return interaction.reply({ content: '🚫 Keine Berechtigung.', ephemeral: true });
        }
        return await command.execute(interaction);
      }
  
      if (interaction.isButton()) {
        console.log(`🔘 Button gedrückt: ${interaction.customId} von ${interaction.user.tag}`);
  
        const handler = buttonHandlers[interaction.customId];
        if (!handler) {
          return interaction.reply({ content: '❌ Kein Button-Handler gefunden.', ephemeral: true });
        }
        return await handler.execute(interaction);
      }
  
      if (interaction.isStringSelectMenu()) {
        console.log(`📑 SelectMenu benutzt: ${interaction.customId} von ${interaction.user.tag}`);
  
        const handler = selectMenuHandlers[interaction.customId];
        if (!handler) {
          return interaction.reply({ content: '❌ Kein SelectMenu-Handler gefunden.', ephemeral: true });
        }
        return await handler.execute(interaction);
      }

      if (interaction.isModalSubmit()) {
        console.log(`📤 Modal abgeschickt: ${interaction.customId} von ${interaction.user.tag}`);

        const handler = modalHandlers[interaction.customId];
        if (!handler) {
          return interaction.reply({ content: '❌ Kein Modal-Handler gefunden.', ephemeral: true });
        }
        return await handler(interaction); // ✅ RICHTIG
      }
    } catch (err) {
      console.error('❌ Fehler bei Interaktion:', err);
      if (!interaction.replied) {
        interaction.reply({ content: '❌ Interner Fehler.', ephemeral: true }).catch(() => {});
      }
    }
  });
  

client.login(process.env.TOKEN);
