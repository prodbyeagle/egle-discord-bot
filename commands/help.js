const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('Displays available commands.')
      .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
   async execute(interaction) {
      const commands = interaction.client.commands;
      const commandList = commands.map(command => {
         let description = `**/${command.data.name}**: ${command.data.description}`;
         // Check if the command requires admin permissions
         const permissions = command.data.defaultPermission !== undefined ? BigInt(command.data.defaultPermission) : 0n;
         if (permissions & BigInt(PermissionFlagsBits.Administrator)) {
            description += ' (Admin Only)';
         }
         return description;
      }).join('\n');

      const embed = new EmbedBuilder()
         .setColor(0x0099FF)
         .setTitle('⚙️ Command List')
         .setDescription(commandList)
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      await interaction.reply({ embeds: [embed], ephemeral: true });
   },
};