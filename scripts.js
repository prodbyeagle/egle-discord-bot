const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ACCEPT_ROLE_ID = '1243691838301274213';

async function handleApplicationModalSubmit(interaction, client) {
   const ign = interaction.fields.getTextInputValue('ign');
   const huges = interaction.fields.getTextInputValue('huges');
   const exclusives = interaction.fields.getTextInputValue('exclusives');
   const rank = interaction.fields.getTextInputValue('rank');
   const gamepasses = interaction.fields.getTextInputValue('gamepasses');

   const user = interaction.guild.members.cache.get(interaction.user.id);
   const joinDate = user.joinedAt.toLocaleDateString();
   const username = user.user.username;
   const avatar = user.user.displayAvatarURL({ format: 'png', dynamic: true });

   const applicationEmbed = new EmbedBuilder()
      .setTitle('🦅 New CLAN Application')
      .addFields(
         { name: 'Username', value: ign, inline: false },
         { name: 'Huges', value: huges, inline: false },
         { name: 'Exclusives', value: exclusives, inline: false },
         { name: 'Rank', value: rank, inline: false },
         { name: 'Gamepasses', value: gamepasses, inline: false },
         { name: 'Join Date', value: joinDate, inline: true },
         { name: 'Discord ID', value: interaction.user.id, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: '🦅 made by @prodbyeagle' })
      .setAuthor({ name: username, iconURL: avatar });

   const buttons = new ActionRowBuilder()
      .addComponents(
         new ButtonBuilder()
            .setCustomId('acceptWithReason')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success),
         new ButtonBuilder()
            .setCustomId('declineWithReason')
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger)
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
   const member = await interaction.guild.members.fetch(userId);

   await member.send(`Your application was ${action} with reason: ${reason}`);
   await interaction.reply({ content: `Application ${action} sent! to ${member}`, ephemeral: true });

   if (action === 'accepted') {
      try {
         const role = interaction.guild.roles.cache.get(ACCEPT_ROLE_ID);
         if (role) {
            await member.roles.add(role);
         } else {
            await interaction.followUp({ content: `Role not found.`, ephemeral: true });
         }
      } catch (error) {
         console.error('Failed to assign role:', error);
         await interaction.followUp({ content: `There was an error assigning the role.`, ephemeral: true });
      }
   }
}

module.exports = {
   handleApplicationModalSubmit,
   handleButtonInteraction,
   handleReasonModalSubmit
};