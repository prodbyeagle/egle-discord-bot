const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('clearmessages')
      .setDescription('Clear messages with options')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addBooleanOption(option =>
         option.setName('delete_pinned_messages')
            .setDescription('Delete Pinned Messages?')
            .setRequired(true)
      )
      .addRoleOption(option =>
         option.setName('exclude_role')
            .setDescription('Exclude role from message clearing')
            .setRequired(false)
      ),
   async execute(interaction) {
      try {
         const pinnedOption = interaction.options.getBoolean('delete_pinned_messages');
         const excludedRole = interaction.options.getRole('exclude_role');
         let messagesToDelete = [];

         await interaction.channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(msg => {
               if ((!msg.pinned || pinnedOption) && (!excludedRole || !msg.member.roles.cache.has(excludedRole.id))) {
                  messagesToDelete.push(msg);
               }
            });
         });

         const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Clear Messages')
            .setDescription(`Messages cleared successfully! ${messagesToDelete.length} messages deleted.`)
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         if (messagesToDelete.length > 0) {
            await interaction.channel.bulkDelete(messagesToDelete);
         } else {
            embed.setDescription('No messages to delete.');
         }

         await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
         await logError(client, error, 'clearMessages');
         await interaction.reply({ content: 'There was an error while clearing messages.', ephemeral: true });
      }
   }
};
