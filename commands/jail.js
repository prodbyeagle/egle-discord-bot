const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('jail')
      .setDescription('Jails a user by assigning the muted role')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addUserOption(option =>
         option.setName('user')
            .setDescription('The user to jail')
            .setRequired(true)),
   async execute(interaction) {
      const user = interaction.options.getUser('user');
      const member = interaction.guild.members.cache.get(user.id);
      const mutedRole = "1243678246755766404";

      if (!mutedRole) {
         const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error')
            .setDescription('Muted role not found.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await member.roles.add(mutedRole);
      const embed = new EmbedBuilder()
         .setColor(0x00FF00)
         .setTitle('Success')
         .setDescription(`${user.tag} has been jailed.`)
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });
      await interaction.reply({ embeds: [embed], ephemeral: true });
   }
};