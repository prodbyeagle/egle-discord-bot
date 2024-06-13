const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('backup')
      .setDescription('Creates a backup of the server.')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   async execute(interaction) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');

      const backupDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      const replacer = (key, value) => typeof value === 'bigint' ? value.toString() : value;

      const backupData = {
         date: backupDate,
         guild: {
            id: interaction.guild.id,
            name: interaction.guild.name,
            channels: interaction.guild.channels.cache.map(channel => ({
               id: channel.id,
               name: channel.name,
               type: channel.type,
               permissions: channel.permissionOverwrites
            })),
            roles: interaction.guild.roles.cache.map(role => ({
               id: role.id,
               name: role.name,
               color: role.color,
               permissions: role.permissions.bitfield.toString()
            })),
            members: interaction.guild.members.cache.map(member => ({
               id: member.id,
               roles: member.roles.cache.map(role => role.id)
            })),
         },
      };

      const fileName = `serverBackup_${backupDate}.json`;
      const jsonBackupData = JSON.stringify(backupData, replacer, 2);

      const attachment = new AttachmentBuilder(Buffer.from(jsonBackupData), { name: fileName });

      const embed = new EmbedBuilder()
         .setColor(0x00FF00)
         .setTitle('Success')
         .setDescription(`Backup was successfully created!`)
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      const sentMessage = await interaction.channel.send({ embeds: [embed], files: [attachment] });
      await interaction.reply("🫵 Backup Send!")

      try {
         await sentMessage.pin();
      } catch (error) {
         console.error('Error pinning the message:', error);
      }
   },
};