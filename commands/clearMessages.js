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
      )
      .addUserOption(option =>
         option.setName('target_user')
            .setDescription('Clear messages from a specific user')
            .setRequired(false)
      ),
   async execute(interaction) {
      try {
         const pinnedOption = interaction.options.getBoolean('delete_pinned_messages');
         const excludedRole = interaction.options.getRole('exclude_role');
         const targetUser = interaction.options.getUser('target_user');
         let messagesToDelete = [];

         await interaction.channel.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach(msg => {
               const twoWeeksAgo = Date.now() - 12096e5; // 12096e5 ms = 14 days
               if (msg.createdTimestamp < twoWeeksAgo) {
                  console.error(`Message ID ${msg.id} is older than 2 weeks and cannot be deleted.`);
               } else if (
                  (!msg.pinned || pinnedOption) &&
                  (!excludedRole || !msg.member.roles.cache.has(excludedRole.id)) &&
                  (!targetUser || msg.author.id === targetUser.id)
               ) {
                  messagesToDelete.push(msg);
               }
            });
         });

         const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Clear Messages')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         if (messagesToDelete.length > 0) {
            try {
               await interaction.channel.bulkDelete(messagesToDelete);
               embed.setDescription(`Messages cleared successfully! ${messagesToDelete.length} messages deleted.`);
            } catch (deleteError) {
               embed.setDescription('Failed to delete messages. Some messages might be older than 2 weeks or there might be other issues.');
               await logError(interaction.client, deleteError, 'bulkDelete messages');
            }
         } else {
            embed.setDescription('No messages to delete.');
         }

         await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
         await logError(interaction.client, error, 'clearmessages command');
         await interaction.reply({ content: `There was an error while clearing messages: ${error.message}`, ephemeral: true });
      }
   }
};
