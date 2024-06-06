const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

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

      const topUsers = await users.find({ $or: [{ level: { $gt: 0 } }, { xp: { $gt: 0 } }] })
         .sort({ level: -1, xp: -1 })
         .limit(10)
         .toArray();

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

      await interaction.reply({ embeds: [embed], ephemeral: true });
      await client.close();
   }
};