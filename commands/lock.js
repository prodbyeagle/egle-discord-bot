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
      await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: false });

      const embed = new EmbedBuilder()
         .setColor(0xFF0000) // Red
         .setTitle('Channel Locked')
         .setDescription('This channel is locked!')
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `${channel} has been locked.`, ephemeral: true });
   }
};