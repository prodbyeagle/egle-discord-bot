const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('unjail')
      .setDescription('Unjails a user by removing the muted role')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addStringOption(option =>
         option.setName('search')
            .setDescription('The user to unjail')
            .setRequired(true)
            .setAutocomplete(true)
      )
      .setDMPermission(false),
   async execute(interaction) {
      const selectedUserId = interaction.options.getString('search');
      if (!selectedUserId) {
         const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription('User ID not provided.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [embed], ephemeral: true });
         return;
      }

      const selectedUser = await interaction.guild.members.fetch(selectedUserId).catch(() => null);
      if (!selectedUser) {
         const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription('User not found.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [embed], ephemeral: true });
         return;
      }

      const mutedRoleId = '1243678246755766404';

      if (selectedUser.roles.cache.has(mutedRoleId)) {
         await selectedUser.roles.remove(mutedRoleId);
         const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Success')
            .setDescription(`${selectedUser.user.tag} has been unjailed.`)
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
         const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠️ Info')
            .setDescription('The user does not have the muted role.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [embed], ephemeral: true });
      }
   }
};