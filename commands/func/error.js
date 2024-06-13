const { EmbedBuilder } = require('discord.js');

async function logError(client, error, context) {
   const logChannelId = '1250827063158378518'; // ID des Log-Channels
   const logChannel = await client.channels.fetch(logChannelId);

   if (!logChannel) {
      console.error('Log channel not found');
      return;
   }

   const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

   const embed = new EmbedBuilder()
      .setTitle('Error Log')
      .setColor('Red')
      .addFields(
         { name: 'Context', value: context, inline: true },
         { name: 'Error', value: error.message || 'Unknown error', inline: false },
         { name: 'Timestamp', value: `<t:${timestamp}:R>`, inline: false }
      )
      .setFooter({ text: `🦅 made by @prodbyeagle` })
      .setTimestamp();

   await logChannel.send({ embeds: [embed] });
}

module.exports = { logError };