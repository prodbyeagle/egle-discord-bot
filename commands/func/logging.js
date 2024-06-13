const { EmbedBuilder } = require('discord.js');

async function logCommand(client, command, user) {
   const logChannelId = '1250827063158378518'; // ID des Log-Channels
   const logChannel = await client.channels.fetch(logChannelId);

   if (!logChannel) {
      console.error('Log channel not found');
      return;
   }

   const timestamp = Math.floor(Date.now() / 1000);

   const embed = new EmbedBuilder()
      .setTitle('Command Log')
      .setColor('Yellow')
      .addFields(
         { name: 'User', value: `<@${user.id}>`, inline: true },
         { name: 'Command', value: command, inline: true },
         { name: 'Timestamp', value: `<t:${timestamp}:R>`, inline: true }
      )
      .setFooter({ text: `🦅 made by @prodbyeagle` })
      .setTimestamp();

   await logChannel.send({ embeds: [embed] });
}

module.exports = { logCommand };
