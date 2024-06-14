require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getDatabase } = require('./func/connectDB');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('resetxp')
      .setDescription('Reset XP for a member')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addUserOption(option =>
         option.setName('member')
            .setDescription('The member whose XP to reset')
            .setRequired(true)),
   async execute(interaction) {
      const member = interaction.options.getMember('member');

      try {
         const database = await getDatabase();
         const users = database.collection('users');

         const result = await users.updateOne(
            { userId: member.id },
            { $set: { xp: 0, level: 0 } }
         );

         const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`🦅 XP Reset`)
            .setDescription(`Successfully reset XP for ${member.displayName}.`)
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         if (result.modifiedCount !== 1) {
            embed.setDescription(`Failed to reset XP for ${member.displayName}.`);
         }

         await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
         console.error('Error resetting XP:', error);
         await logError(interaction.client, error, 'resetXP');
         const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Error')
            .setDescription('There was an error while resetting XP.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
   },
};