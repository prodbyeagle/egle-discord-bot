const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('botstats')
      .setDescription('Displays important statistics about the bot'),

   async execute(interaction) {
      const client = interaction.client;

      // Berechne die Uptime
      const totalSeconds = (client.uptime / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor(totalSeconds / 3600) % 24;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const seconds = Math.floor(totalSeconds % 60);

      const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      const ping = client.ws.ping;

      const embed = new EmbedBuilder()
         .setTitle('🤖 Bot Statistics')
         .setColor('Blue')
         .addFields(
            { name: 'Ping', value: `${ping} ms`, inline: true },
            { name: 'Uptime', value: uptime, inline: true },
            { name: 'Server Count', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'User Count', value: `${client.users.cache.size}`, inline: true },
            { name: 'Channel Count', value: `${client.channels.cache.size}`, inline: true }
         )
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      await interaction.reply({ embeds: [embed] });
   },
};
