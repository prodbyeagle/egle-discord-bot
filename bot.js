require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const { addXP } = require('./commands/func/addXP');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
   console.log(`🗝️  Logged in as ${client.user.tag}`);

   client.user.setPresence({
      activities: [{
         type: ActivityType.Custom,
         name: "egle_presence",
         state: "🦅 EGLE"
      }]
   })
});

client.on('messageCreate', async message => {
   if (!message.author.bot) {
      try {
         await addXP(message.author.id, 10);
      } catch (error) {
         console.error('Error adding XP:', error);
      }
   }
});


client.on('interactionCreate', async interaction => {
   if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
         await command.execute(interaction);
      } catch (error) {
         console.error(error);
         await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
   } else if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);

      if (interaction.commandName === 'unjail' && focusedOption.name === 'search') {
         const guild = interaction.guild;
         const mutedRoleId = '1243678246755766404';

         try {
            const mutedRole = await guild.roles.fetch(mutedRoleId);

            if (!mutedRole) {
               console.error(`Role with ID ${mutedRoleId} not found.`);
               return;
            }

            await guild.members.fetch();

            const membersWithMutedRole = mutedRole.members.map(member => ({
               name: member.user.username,
               value: member.user.id
            }));

            await interaction.respond(membersWithMutedRole.slice(0, 25));
         } catch (error) {
            console.error('Error fetching members or roles:', error);
         }
      }
   } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'applicationModal') {
         const { handleApplicationModalSubmit } = require('./scripts');
         await handleApplicationModalSubmit(interaction, client);
      } else if (interaction.customId.endsWith('ReasonModal')) {
         const { handleReasonModalSubmit } = require('./scripts');
         await handleReasonModalSubmit(interaction);
      }
   } else if (interaction.isButton()) {
      const { handleButtonInteraction } = require('./scripts');
      await handleButtonInteraction(interaction);
   }
});

client.login(process.env.DISCORD_TOKEN);