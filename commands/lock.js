const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('lock')
      .setDescription('Locks a channel')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addChannelOption(option =>
         option.setName('channel')
            .setDescription('The channel to lock')
            .setRequired(true)),
   async execute(interaction) {
      const channel = interaction.options.getChannel('channel');

      if (!channel) {
         return interaction.reply({ content: 'Channel not found.', ephemeral: true });
      }

      try {
         await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });

         const embed = new EmbedBuilder()
            .setColor(0xFF0000) // Red
            .setTitle('Channel Locked')
            .setDescription('This channel is locked!')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         await channel.send({ embeds: [embed] });
         await interaction.reply({ content: `${channel} has been locked.`, ephemeral: true });
      } catch (error) {
         console.error('Error locking the channel:', error);
         await interaction.reply({ content: 'There was an error locking the channel.', ephemeral: true });
      }
   }
};