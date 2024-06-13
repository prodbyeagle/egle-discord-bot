const { EmbedBuilder } = require('discord.js');

async function logError(client, error, context) {
   const logChannelId = '1250827063158378518';
   const pingRoleId = '893759402832699392';
   const logChannel = await client.channels.fetch(logChannelId);

   if (!logChannel) {
      console.error('Log channel not found');
      return;
   }

   const timestamp = Math.floor(Date.now() / 1000);

   const embed = new EmbedBuilder()
      .setTitle('Error Log')
      .setColor('Red')
      .addFields(
         { name: 'Context', value: context, inline: false },
         { name: 'Error', value: error.message || 'Unknown error', inline: true },
         { name: 'Timestamp', value: `<t:${timestamp}:R>`, inline: true },
         { name: 'Notified', value: `<@${pingRoleId}>`, inline: false}
      )
      .setFooter({ text: `🦅 made by @prodbyeagle` })
      .setTimestamp();

   await logChannel.send({ embeds: [embed] });
}

module.exports = { logError };