const { EmbedBuilder } = require('discord.js');

const blacklist = [
   'Error ending giveaway with message ID:'
];

async function logError(client, error, context) {
   const logChannelId = '1250827063158378518';
   const logChannel = await client.channels.fetch(logChannelId);

   if (!logChannel) {
      console.error('Log channel not found');
      return;
   }

   const isInBlacklist = blacklist.some(text => context.includes(text));

   if (isInBlacklist) {
      return;
   }

   const timestamp = Math.floor(Date.now() / 1000);

   const embed = new EmbedBuilder()
      .setTitle('Error Log')
      .setColor('Red')
      .addFields(
         { name: 'Context', value: context, inline: false },
         { name: 'Error', value: error.message || 'Unknown error', inline: true },
         { name: 'Timestamp', value: `<t:${timestamp}:R>`, inline: true }
      )
      .setFooter({ text: '🦅 made by @prodbyeagle' })
      .setTimestamp();

   await logChannel.send({ embeds: [embed] });
}

module.exports = { logError };