const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Modes, setBotPresence } = require('./func/modes');

async function setCurrentMode(client, mode) {
   client.currentMode = mode;
   await setBotPresence(client, mode);
}

module.exports = {
   data: new SlashCommandBuilder()
      .setName('setmode')
      .setDescription('Set the bot mode')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addStringOption(option =>
         option.setName('mode')
            .setDescription('Choose the bot mode')
            .setRequired(true)
            .addChoices([
               { name: 'Debug Mode', value: Modes.DEBUG },
               { name: 'Maintenance Mode', value: Modes.MAINTENANCE },
               { name: 'Online Mode', value: Modes.ONLINE },
            ])
      ),
   async execute(interaction) {
      const mode = interaction.options.getString('mode');

      if (!Object.values(Modes).includes(mode)) {
         return interaction.reply({ content: 'Invalid mode specified.', ephemeral: true });
      }

      try {
         await setCurrentMode(interaction.client, mode);
         await interaction.reply({ content: `Bot mode set to: ${mode}`, ephemeral: true });
      } catch (error) {
         console.error('Error setting bot mode:', error);
         await interaction.reply({ content: 'Failed to set bot mode.', ephemeral: true });
      }
   },
};
