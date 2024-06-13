require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { addXP } = require('./commands/func/addXP');
const { getLeaderboard } = require('./commands/func/getLeaderboard');
const { handleButtonInteraction } = require('./scripts');
const { checkEventTime } = require('./commands/func/checkEventTime');
const { sendLevelUpMessage } = require('./commands/func/sendLevelUpMessage');

const client = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
   ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
   const command = require(`./commands/${file}`);
   client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
   console.log(`🗝️  Logged in as ${client.user.tag}`);
   await checkEventTime();

   setInterval(async () => {
      await checkEventTime();
   }, 60000);

   client.user.setPresence({
      activities: [{
         type: ActivityType.Custom,
         name: "egle_presence",
         state: "🦅 EGLE"
      }]
   });
});

client.on('messageCreate', async message => {
   try {
      if (!message || !message.author || message.author.bot) return;

      const member = message.guild ? message.guild.members.cache.get(message.author.id) : null;
      const xpGained = 10;
      const updatedUser = await addXP(message.author.id, xpGained, message.author.username, member);

      if (updatedUser) {
         const newLevel = updatedUser.level;
         const previousXP = updatedUser.xp - Math.floor(xpGained * (updatedUser.level > 1 ? 1.1 ** (updatedUser.level - 1) : 1));
         const requiredXP = Math.floor(100 * 1.1 ** (newLevel - 1));

         if (previousXP < requiredXP && updatedUser.xp >= requiredXP) {
            await sendLevelUpMessage(message.author, newLevel);
         }
      }
   } catch (error) {
      console.error('Error adding XP or sending level up message:', error);
   }
});

client.on('interactionCreate', async interaction => {
   if (interaction.isButton()) {
      const customId = interaction.customId;

      // Überprüfe, ob der Button für das Leaderboard ist
      if (customId === 'daily_leaderboard' || customId === 'weekly_leaderboard' || customId === 'monthly_leaderboard') {
         const period = customId.split('_')[0];
         try {
            const leaderboard = await getLeaderboard(period);

            const embed = new EmbedBuilder()
               .setTitle(`${capitalizeFirstLetter(period)} Leaderboard`)
               .setColor('Blue')
               .setTimestamp()
               .setFooter({ text: '🦅 made by @prodbyeagle' });

            leaderboard.forEach((user, index) => {
               let rankEmoji = '';
               if (index === 0) {
                  rankEmoji = ':first_place:';
               } else if (index === 1) {
                  rankEmoji = ':second_place:';
               } else if (index === 2) {
                  rankEmoji = ':third_place:';
               }

               embed.addFields(
                  { name: `${rankEmoji}#${index + 1}`, value: `<@${user._id}> - XP: ${user.totalXP}` }
               );
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
         } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.reply({ content: 'Error fetching leaderboard.', ephemeral: true });
         }
      } else {
         switch (customId) {
            case 'acceptWithReason':
               await handleButtonInteraction(interaction, 'accept');
               break;
            case 'declineWithReason':
               await handleButtonInteraction(interaction, 'decline');
               break;
            default:
               await interaction.reply({ content: 'Invalid button clicked.', ephemeral: true });
               break;
         }
      }
   }

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
   }
});

client.login(process.env.DISCORD_TOKEN);

function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}