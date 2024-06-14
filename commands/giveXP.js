const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addXP } = require('./func/addXP');
const { sendLevelUpMessage } = require('./func/sendLevelUpMessage');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('givexp')
      .setDescription('Give XP to a user')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to give XP to')
            .setRequired(true))
      .addIntegerOption(option =>
         option.setName('xp')
            .setDescription('The amount of XP to give')
            .setMinValue(0)
            .setMaxValue(10000000000)
            .setRequired(true)),

   async execute(interaction) {
      try {
         const targetUser = interaction.options.getUser('user');
         if (!targetUser) {
            console.error('User not found in options.');
            return interaction.reply({ content: 'User not found.', ephemeral: true });
         }

         const xpAmount = interaction.options.getInteger('xp');
         if (!xpAmount || xpAmount <= 0) {
            console.error('Invalid XP amount:', xpAmount);
            return interaction.reply({ content: 'Invalid XP amount specified.', ephemeral: true });
         }

         let member;
         try {
            member = await interaction.guild.members.fetch(targetUser.id);
         } catch (err) {
            console.error(`Error fetching member: ${err}`);
            return interaction.reply({ content: 'Error fetching member.', ephemeral: true });
         }

         const updatedUser = await addXP(targetUser.id, xpAmount, targetUser.username, member);

         if (updatedUser) {
            const newLevel = updatedUser.level;
            const previousXP = updatedUser.xp - Math.floor(xpAmount * (updatedUser.level > 1 ? 1.1 ** (updatedUser.level - 1) : 1));
            const requiredXP = Math.floor(100 * 1.1 ** (newLevel - 1));

            if (previousXP < requiredXP && updatedUser.xp >= requiredXP) {
               await sendLevelUpMessage(targetUser, newLevel);
            }
         }

         return interaction.reply({ content: `Gave ${xpAmount} XP to ${targetUser.username}.`, ephemeral: true });

      } catch (error) {
         console.error('Error giving XP:', error);
         await logError(client, error, 'giveXP');
         return interaction.reply({ content: 'An error occurred while giving XP.', ephemeral: true });
      }
   },
};