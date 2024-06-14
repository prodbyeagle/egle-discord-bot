require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getDatabase } = require('../commands/func/connectDB');
const { logError } = require('./func/error');

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
      try {
         const database = await getDatabase();
         const users = database.collection('users');

         const targetUser = interaction.options.getUser('user');
         const userId = targetUser.id;

         await users.updateOne(
            { userId },
            { $set: { banned: true, username: targetUser.username } },
            { upsert: true }
         );

         await interaction.reply({ content: `User <@${userId}> has been banned from the leaderboard.`, ephemeral: true });
      } catch (error) {
         console.error('Error banning user:', error);
         await logError(client, error, 'ban');
         await interaction.reply({ content: 'There was an error banning the user.', ephemeral: true });
      }
   }
};