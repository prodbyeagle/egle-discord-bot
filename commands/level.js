require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getDatabase } = require('./func/connectDB');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('level')
      .setDescription('Shows your level and XP')
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to show the level for')
            .setRequired(false)),
   async execute(interaction) {
      try {
         const database = await getDatabase();
         const users = database.collection('users');

         const targetUser = interaction.options.getUser('user') || interaction.user;
         const userId = targetUser.id;
         let user = await users.findOne({ userId });

         if (!user) {
            user = { userId, username: targetUser.username, xp: 0, level: 0, banned: false };
            await users.insertOne(user);
         }

         if (user.banned) {
            await interaction.reply({ content: 'This user is banned from the leaderboard.', ephemeral: true });
            return;
         }

         const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s Level`)
            .addFields(
               { name: 'Level', value: user.level.toString(), inline: true },
               { name: 'XP', value: user.xp.toString(), inline: true }
            )
            .setColor('Random')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
         console.error('Error showing level:', error);
         await logError(interaction.client, error, 'level');
         const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Error')
            .setDescription('An error occurred while trying to retrieve the level.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [embed], ephemeral: true });
      }
   }
};
