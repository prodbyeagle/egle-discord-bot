require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { getLeaderboard } = require('./func/getLeaderboard');  // Ensure correct path

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('See who is in the top 10 Leaderboard'),
   async execute(interaction) {
      await client.connect();
      const database = client.db('EGLEDB');
      const users = database.collection('users');

      const topUsers = await users.find({ banned: { $ne: true } }).sort({ level: -1, xp: -1 }).limit(10).toArray();

      const embed = new EmbedBuilder()
         .setTitle('Level Leaderboard')
         .setColor('Random')
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      topUsers.forEach((user, index) => {
         let rankEmoji = '';
         if (index === 0) {
            rankEmoji = ':first_place:';
         } else if (index === 1) {
            rankEmoji = ':second_place:';
         } else if (index === 2) {
            rankEmoji = ':third_place:';
         }

         embed.addFields(
            { name: `${rankEmoji}#${index + 1}`, value: `<@${user.userId}> - Level: ${user.level} XP: ${user.xp}` }
         );
      });

      const dailyButton = new ButtonBuilder()
         .setCustomId('daily_leaderboard')
         .setLabel('Daily')
         .setStyle(ButtonStyle.Primary);

      const weeklyButton = new ButtonBuilder()
         .setCustomId('weekly_leaderboard')
         .setLabel('Weekly')
         .setStyle(ButtonStyle.Primary);

      const monthlyButton = new ButtonBuilder()
         .setCustomId('monthly_leaderboard')
         .setLabel('Monthly')
         .setStyle(ButtonStyle.Primary);

      const actionRow = new ActionRowBuilder()
         .addComponents(dailyButton, weeklyButton, monthlyButton);

      await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });
      await client.close();
   }
};