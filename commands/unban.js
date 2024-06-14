require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getDatabase } = require('./func/connectDB');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('unban')
      .setDescription('Unban a user from the leaderboard')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to unban')
            .setRequired(true)),
   async execute(interaction) {
      let database;
      try {
         database = await getDatabase();
         const users = database.collection('users');

         const targetUser = interaction.options.getUser('user');
         const userId = targetUser.id;

         const user = await users.findOne({ userId });

         if (!user || !user.banned) {
            const notBannedEmbed = new EmbedBuilder()
               .setColor(0xFF0000)
               .setTitle('User Not Banned')
               .setDescription(`User <@${userId}> was not found in the leaderboard or was already unbanned.`)
               .setTimestamp()
               .setFooter({ text: '🦅 made by @prodbyeagle' });

            return await interaction.reply({ embeds: [notBannedEmbed], ephemeral: true });
         }

         const result = await users.updateOne(
            { userId },
            { $set: { banned: false } }
         );

         const replyEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('User Unbanned')
            .setDescription(`User <@${userId}> has been unbanned from the leaderboard.`)
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
      } catch (error) {
         console.error('Error unbanning user:', error);
         await logError(interaction.client, error, 'unban');

         const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error')
            .setDescription('An error occurred while trying to unban the user.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } finally {
         //nothing
      }
   },
};