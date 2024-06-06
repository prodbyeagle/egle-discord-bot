require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a user from the leaderboard')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to ban')
            .setRequired(true)),
   async execute(interaction) {
      await client.connect();
      const database = client.db('EGLEDB');
      const users = database.collection('users');

      const targetUser = interaction.options.getUser('user');
      const userId = targetUser.id;

      await users.updateOne(
         { userId },
         { $set: { banned: true, username: targetUser.username } },
         { upsert: true }
      );

      await interaction.reply({ content: `User <@${userId}> has been banned from the leaderboard.`, ephemeral: true });
      await client.close();
   }
};
