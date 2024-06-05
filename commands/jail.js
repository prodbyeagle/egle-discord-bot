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
      const mutedRole = interaction.guild.roles.cache.get("1243678246755766404");
      const memberRole = interaction.guild.roles.cache.get("1243678249037594755");

      if (!mutedRole) {
         const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription('Muted role not found.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (!memberRole) {
         const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription('Member role not found. (Weird 🤔...)')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (member.roles.cache.has(mutedRole.id)) {
         const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Error')
            .setDescription(`<@${user.id}> already has the muted role.`)
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      await member.roles.add(mutedRole);
      await member.roles.remove(memberRole);
      const embed = new EmbedBuilder()
         .setColor(0x00FF00)
         .setTitle('✅ Success')
         .setDescription(`<@${user.id}> has been jailed.`)
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });
      await interaction.reply({ embeds: [embed], ephemeral: true });
   }
};
