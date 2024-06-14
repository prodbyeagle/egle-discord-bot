const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getDatabase } = require('./func/connectDB');

// Function to format XP values
function formatXPValue(xp) {
   if (xp >= 1e12) {
      return (xp / 1e12).toFixed(1) + 'T';
   } else if (xp >= 1e9) {
      return (xp / 1e9).toFixed(1) + 'B';
   } else if (xp >= 1e6) {
      return (xp / 1e6).toFixed(1) + 'M';
   } else if (xp >= 1e3) {
      return (xp / 1e3).toFixed(1) + 'k';
   } else {
      return xp.toString();
   }
}

module.exports = {
   data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('See who is in the top 10 Leaderboard'),
   async execute(interaction) {
      try {
         const database = await getDatabase();
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
               { name: `${rankEmoji}#${index + 1}`, value: `<@${user.userId}> - Level: ${user.level} XP: ${formatXPValue(user.xp)}` }
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
      } catch (error) {
         await interaction.reply({ content: 'Error fetching leaderboard.', ephemeral: true });
      } finally {
         //nothing
      }
   },
};