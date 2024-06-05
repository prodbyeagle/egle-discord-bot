const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Get the stats of the Discord Guild'),
   async execute(interaction, client) {
      const serverStatsEmbed = await getServerStatsEmbed(interaction.guild);

      await interaction.reply({ embeds: [serverStatsEmbed], ephemeral: true });
   },
};

async function getServerStatsEmbed(guild) {

   return new EmbedBuilder()
      .setColor(0x7289DA)
      .setTitle(`🦅 ${guild.name} Server Stats`)
      .addFields(
         { name: ':busts_in_silhouette: Members', value: guild.memberCount.toString(), inline: false },
         { name: ':calendar: Server Creation Date', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false },
      )
      .setTimestamp()
      .setFooter({ text: '🦅 made by @prodbyeagle' });
}