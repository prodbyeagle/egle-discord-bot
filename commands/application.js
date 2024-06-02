const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('application')
      .setDescription('Submit an application'),
   async execute(interaction) {
      const modal = new ModalBuilder()
         .setCustomId('applicationModal')
         .setTitle('Application Form');

      const ignInput = new TextInputBuilder()
         .setCustomId('ign')
         .setLabel('What is your IGN (Roblox Username)?')
         .setStyle(TextInputStyle.Short);

      const hugesInput = new TextInputBuilder()
         .setCustomId('huges')
         .setLabel('How many Huges do you have?')
         .setStyle(TextInputStyle.Short);

      const exclusivesInput = new TextInputBuilder()
         .setCustomId('exclusives')
         .setLabel('How many Exclusives do you have?')
         .setStyle(TextInputStyle.Short);

      const rankInput = new TextInputBuilder()
         .setCustomId('rank')
         .setLabel('What Rank are you?')
         .setStyle(TextInputStyle.Short);

      const gamepassesInput = new TextInputBuilder()
         .setCustomId('gamepasses')
         .setLabel('Which Gamepasses do you own?')
         .setStyle(TextInputStyle.Short);

      modal.addComponents(
         new ActionRowBuilder().addComponents(ignInput),
         new ActionRowBuilder().addComponents(hugesInput),
         new ActionRowBuilder().addComponents(exclusivesInput),
         new ActionRowBuilder().addComponents(rankInput),
         new ActionRowBuilder().addComponents(gamepassesInput),
      );

      await interaction.showModal(modal);
   },
};
