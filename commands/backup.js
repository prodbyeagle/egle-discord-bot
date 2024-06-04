const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('backup')
      .setDescription('Creates a backup of the server.')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   async execute(interaction) {
      const currentDate = new Date();
      const backupDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
      const replacer = (key, value) => typeof value === 'bigint' ? value.toString() : value;

      const backupData = {
         date: backupDate,
         guild: {
            id: interaction.guild.id,
            name: interaction.guild.name,
            channels: interaction.guild.channels.cache.map(channel => {
               const channelData = {
                  id: channel.id,
                  name: channel.name,
                  type: channel.type,
                  permissions: channel.permissionOverwrites
               };
               return channelData;
            }),
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

      await interaction.reply({ embeds: [embed], files: [attachment], ephemeral: true });
   },
};