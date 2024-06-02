require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
   console.log(`Command: ${command.data.name} added`);
}

client.once('ready', () => {
   console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
   if (!interaction.isCommand()) return;

   const command = client.commands.get(interaction.commandName);

   if (!command) return;

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
   }
});

client.on('interactionCreate', async interaction => {
   if (interaction.isModalSubmit() && interaction.customId === 'applicationModal') {
      const { handleApplicationModalSubmit } = require('./scripts');
      await handleApplicationModalSubmit(interaction, client);
   } else if (interaction.isButton()) {
      const { handleButtonInteraction } = require('./scripts');
      await handleButtonInteraction(interaction);
   }
});

client.login(process.env.DISCORD_TOKEN);
