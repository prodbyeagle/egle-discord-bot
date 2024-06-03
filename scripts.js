const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const FooterPic = "https://yt3.googleusercontent.com/N5nZ_-pLc_mTg__L4hPlPSSOOV6tZ8BDJc_MGZe8xMGwxodaO0oIL_5zVxoL47_s2gnpsFiVDxc=s88-c-k-c0x00ffffff-no-rj"

async function handleApplicationModalSubmit(interaction, client) {
   const ign = interaction.fields.getTextInputValue('ign');
   const huges = interaction.fields.getTextInputValue('huges');
   const exclusives = interaction.fields.getTextInputValue('exclusives');
   const rank = interaction.fields.getTextInputValue('rank');
   const gamepasses = interaction.fields.getTextInputValue('gamepasses');

   const applicationEmbed = new EmbedBuilder()
      .setTitle('🦅 New CLAN Application')
      .addFields(
         { name: 'Username', value: ign, inline: false },
         { name: 'Huges', value: huges, inline: false },
         { name: 'Exclusives', value: exclusives, inline: false },
         { name: 'Rank', value: rank, inline: false },
         { name: 'Gamepasses', value: gamepasses, inline: false },
         { name: 'Discord ID', value: interaction.user.id, inline: false }  // Store the Discord user ID
      )
      .setTimestamp()
      .setFooter({ text: '🦅 made by @prodbyeagle', iconURL: FooterPic });

   const buttons = new ActionRowBuilder()
      .addComponents(
         new ButtonBuilder().setCustomId('acceptWithReason').setLabel('Accept').setStyle(ButtonStyle.Success),
         new ButtonBuilder().setCustomId('declineWithReason').setLabel('Decline').setStyle(ButtonStyle.Danger)
      );

   const channel = await client.channels.fetch('1243696536668340284');
   await channel.send({ embeds: [applicationEmbed], components: [buttons] });

   await interaction.reply({ content: 'Application submitted successfully!', ephemeral: true });
}

async function handleButtonInteraction(interaction) {
   const buttonId = interaction.customId;

   switch (buttonId) {
      case 'declineWithReason':
         await openReasonModal(interaction, 'decline');
         break;
      case 'acceptWithReason':
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
      .setStyle(TextInputStyle.Paragraph);

   modal.addComponents(
      new ActionRowBuilder().addComponents(reasonInput)
   );

   await interaction.showModal(modal);
}

async function handleReasonModalSubmit(interaction) {
   const reason = interaction.fields.getTextInputValue('reason');
   const action = interaction.customId.includes('decline') ? 'declined' : 'accepted';

   const userId = interaction.message.embeds[0].fields.find(field => field.name === 'Discord ID').value;
   const user = await interaction.client.users.fetch(userId);

   await user.send(`Your application was ${action} with reason: ${reason}`);
   await interaction.reply({ content: `Application ${action} with reason sent!`, ephemeral: true });

   const channel = await interaction.client.channels.fetch('1243696536668340284');
   await channel.send({ content: `Application ${action} sent!`, ephemeral: true });
}

module.exports = {
   handleApplicationModalSubmit,
   handleButtonInteraction,
   handleReasonModalSubmit
};