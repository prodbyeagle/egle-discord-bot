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
      await channel.permissionOverwrites.create(interaction.guild.id, { SendMessages: true });

      const embed = new EmbedBuilder()
         .setColor(0x00FF00)
         .setTitle('Channel Unlocked')
         .setDescription('This channel is now unlocked!')
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `${channel} has been unlocked.`, ephemeral: true });
   }
};