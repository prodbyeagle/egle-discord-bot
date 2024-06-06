require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('level')
      .setDescription('Shows your level and XP')
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to show the level for')
            .setRequired(false)),
   async execute(interaction) {
      await client.connect();
      const database = client.db('EGLEDB');
      const users = database.collection('users');

      // Get the user option or default to the interaction user
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const userId = targetUser.id;
      let user = await users.findOne({ userId });

      if (!user) {
         user = { userId, username: targetUser.username, xp: 0, level: 0, banned: false };
         await users.insertOne(user);
      }

      if (user.banned) {
         await interaction.reply({ content: 'This user is banned from the leaderboard.', ephemeral: true });
         await client.close();
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
      await client.close();
   }
};