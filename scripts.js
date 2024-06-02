const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

async function handleApplicationModalSubmit(interaction, client) {
   const ign = interaction.fields.getTextInputValue('ign');
   const huges = interaction.fields.getTextInputValue('huges');
   const exclusives = interaction.fields.getTextInputValue('exclusives');
   const rank = interaction.fields.getTextInputValue('rank');
   const gamepasses = interaction.fields.getTextInputValue('gamepasses');

   const applicationEmbed = new EmbedBuilder()
      .setTitle('🦅 New CLAN Application')
      .addFields(
         { name: 'IGN', value: ign, inline: false },
         { name: 'Huges', value: huges, inline: false },
         { name: 'Exclusives', value: exclusives, inline: false },
         { name: 'Rank', value: rank, inline: false },
         { name: 'Gamepasses', value: gamepasses, inline: false },
      )
      .setTimestamp();

   const buttons = new ActionRowBuilder()
      .addComponents(
         new ButtonBuilder().setCustomId('accept').setLabel('Accept').setStyle(ButtonStyle.Success),
         new ButtonBuilder().setCustomId('decline').setLabel('Decline').setStyle(ButtonStyle.Danger),
         new ButtonBuilder().setCustomId('declineWithReason').setLabel('Decline with Reason').setStyle(ButtonStyle.Secondary),
         new ButtonBuilder().setCustomId('acceptWithReason').setLabel('Accept with Reason').setStyle(ButtonStyle.Secondary)
      );

   const channel = await client.channels.fetch('1243696536668340284');
   await channel.send({ embeds: [applicationEmbed], components: [buttons] });

   await interaction.reply({ content: 'Application submitted successfully!', ephemeral: true });
}

async function handleButtonInteraction(interaction) {
   const buttonId = interaction.customId;

   switch (buttonId) {
      case 'accept':
         await interaction.reply('Application accepted.');
         break;
      case 'decline':
         await interaction.reply('Application declined.');
         break;
      case 'declineWithReason':
         // Open a modal for providing reason
         await openReasonModal(interaction, 'decline');
         break;
      case 'acceptWithReason':
         // Open a modal for providing reason
         await openReasonModal(interaction, 'accept');
         break;
      default:
         await interaction.reply('Unknown action.');
         break;
   }
}

async function openReasonModal(interaction, action) {
   const modal = new ModalBuilder()
      .setCustomId(`${action}ReasonModal`)
      .setTitle(`${action.charAt(0).toUpperCase() + action.slice(1)} with Reason`);

   const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Please provide the reason')
      .setStyle(TextInputStyle.Short);

   modal.addComponents(
      new ActionRowBuilder().addComponents(reasonInput)
   );

   // Show the modal and listen for the result
   const reasonResult = await interaction.showModal(modal);

   // Check if the interaction was not canceled and if a reason was provided
   if (!reasonResult.isCanceled() && reasonResult.values && reasonResult.values.reason) {
      const reason = reasonResult.values.reason;

      // Send the reason as a message
      await interaction.followUp(`Reason provided: ${reason}`);
   } else {
      // If the interaction was canceled or no reason was provided, inform the user
      await interaction.followUp('Reason was not provided.');
   }
}


module.exports = {
   handleApplicationModalSubmit,
   handleButtonInteraction
};