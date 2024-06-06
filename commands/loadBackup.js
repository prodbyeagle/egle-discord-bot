const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const axios = require('axios');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('loadbackup')
      .setDescription('Restore server state from backup')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   async execute(interaction) {
      try {
         const tempChannelName = `backup-upload-${Date.now()}`;
         const tempChannel = await interaction.guild.channels.create({
            name: tempChannelName,
            type: ChannelType.GuildText,
         });
         const channelLink = `https://discord.com/channels/${interaction.guild.id}/${tempChannel.id}`;
         await interaction.reply({ content: `Please upload the backup file to the temporary channel here: ${channelLink}`, ephemeral: true });

         const filter = message => message.author.id === interaction.user.id && message.attachments.size > 0;
         const collected = await tempChannel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

         const attachment = collected.first().attachments.first();

         if (!attachment) {
            await interaction.followUp({ content: 'No file was uploaded. Operation cancelled.', ephemeral: true });
            await tempChannel.delete();
            return;
         }

         const response = await axios.get(attachment.url, { responseType: 'text' });
         const backupData = response.data;
         const parsedData = JSON.parse(backupData);

         // Restore server state (example: create channels, roles, etc.)
         // Replace the example logic with your own logic based on the parsed data

         await tempChannel.delete();

         await interaction.followUp(`Backup file has been successfully read and found ${parsedData.guild.channels.length} channels and ${parsedData.guild.roles.length} roles.`);
      } catch (error) {
         console.error('Error loading backup:', error);
         if (!interaction.replied) {
            await interaction.reply({ content: 'There was an error while loading the backup.', ephemeral: true });
         }
      }
   }
};