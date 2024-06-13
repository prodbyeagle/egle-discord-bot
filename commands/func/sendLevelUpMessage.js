const { EmbedBuilder } = require('discord.js');

async function sendLevelUpMessage(user, level) {
   try {
      const embed = new EmbedBuilder()
         .setTitle('🎉 Level Up!')
         .setDescription(`You leveled to ${level}!`)
         .setColor('Green')
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      await user.send({ embeds: [embed] });
   } catch (error) {
      console.error('Error sending level up message:', error);
   }
}

module.exports = { sendLevelUpMessage };
