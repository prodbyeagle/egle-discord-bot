const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { giveXP } = require('./func/giveXP');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('givexp')
      .setDescription('Gives XP to a specified user')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to give XP to')
            .setRequired(true))
      .addIntegerOption(option =>
         option.setName('xp_value')
            .setDescription('The amount of XP to give')
            .setRequired(true)),
   async execute(interaction) {
      try {
         const user = interaction.options.getUser('user');
         const xp_value = interaction.options.getInteger('xp_value');

         await giveXP(user.username, xp_value);
         await interaction.reply(`Gave ${xp_value} XP to user ${user.username}.`);
      } catch (error) {
         await logError(client, error, 'giveXP');
         await interaction.reply({ content: 'There was an error giving XP.', ephemeral: true });
      }
   },
};
