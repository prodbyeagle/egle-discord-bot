require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Unban a user from the leaderboard')
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to unban')
            .setRequired(true)),
   async execute(interaction) {
      await client.connect();
      const database = client.db('EGLEDB');
      const users = database.collection('users');

      const targetUser = interaction.options.getUser('user');
      const userId = targetUser.id;

      await users.updateOne(
         { userId },
         { $set: { banned: false, username: targetUser.username } },
         { upsert: true }
      );

      await interaction.reply({ content: `User <@${userId}> has been unbanned from the leaderboard.`, ephemeral: true });
      await client.close();
   }
};
