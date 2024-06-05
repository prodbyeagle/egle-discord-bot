const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('unlock')
      .setDescription('Unlocks a channel')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addChannelOption(option =>
         option.setName('channel')
            .setDescription('The channel to unlock')
            .setRequired(true)),
   async execute(interaction) {
      const channel = interaction.options.getChannel('channel');

      if (!channel) {
         return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      }

      try {
         await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });

         const embed = new EmbedBuilder()
            .setColor(0x00FF00) // Green
            .setTitle('Channel Unlocked')
            .setDescription('This channel is now unlocked!')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         await channel.send({ embeds: [embed] });
         await interaction.reply({ content: `${channel} has been unlocked.`, ephemeral: true });
      } catch (error) {
         console.error('Error unlocking the channel:', error);
         await interaction.reply({ content: 'There was an error unlocking the channel.', ephemeral: true });
      }
   }
};
