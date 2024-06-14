const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('commands')
      .setDescription('Displays available commands.'),
   async execute(interaction) {
      const commands = interaction.client.commands;
      const commandList = commands.map(command => {
         let description = `**/${command.data.name}**: ${command.data.description}`;

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

// const { SlashCommandBuilder, Collection, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

// module.exports = {
//    data: new SlashCommandBuilder()
//       .setName('commands')
//       .setDescription('Displays available commands (paginated).'),
//    async execute(interaction) {
//       // Handle potential issue with commands not being an array
//       let commands;
//       try {
//          commands = interaction.client.commands; // Assuming commands are stored in a Collection
//       } catch (error) {
//          console.error('Error accessing commands:', error);
//          return await interaction.reply({ content: 'An error occurred while retrieving commands.', ephemeral: true });
//       }

//       // Ensure commands is a Collection (optional)
//       if (!(commands instanceof Collection)) {
//          console.error('commands is not a Collection:', commands);
//          return await interaction.reply({ content: 'An error occurred while retrieving commands.', ephemeral: true });
//       }

//       // Function to create paginated embeds
//       const createPageEmbed = (pageNumber) => {
//          const commandsArray = Array.from(commands.values()); // Convert Collection to array
//          const pageStart = pageNumber * 10; // Adjust for desired items per page
//          const pageEnd = Math.min(pageStart + 10, commandsArray.length);

//          // Handle potential empty commands array
//          if (commandsArray.length === 0) {
//             return new EmbedBuilder()
//                .setColor(0x0099FF)
//                .setTitle('⚙️ Command List')
//                .setDescription('There are no registered commands.')
//                .setTimestamp()
//                .setFooter({ text: ' made by @prodbyeagle' });
//          }

//          const pageCommands = commandsArray.slice(pageStart, pageEnd).map(command => {
//             let description = `**/${command.data.name}**: ${command.data.description}`;
//             return description;
//          }).join('\n');

//          const embed = new EmbedBuilder()
//             .setColor(0x0099FF)
//             .setTitle('⚙️ Command List')
//             .setDescription(pageCommands)
//             .setTimestamp()
//             .setFooter({ text: ' made by @prodbyeagle' });

//          console.log(embed)

//          if (commandsArray.length > 10) { // Enable buttons only if there's more than one page
//             const row = new ActionRowBuilder()
//                .addComponents(
//                   new ButtonBuilder()
//                      .setCustomId('prev_page')
//                      .setLabel('Previous Page')
//                      .setStyle(pageNumber === 0 ? ButtonStyle.Secondary : ButtonStyle.Primary)
//                      .setDisabled(pageNumber === 0), // Disable prev button on first page
//                   new ButtonBuilder()
//                      .setCustomId('next_page')
//                      .setLabel('Next Page')
//                      .setStyle(pageNumber === Math.ceil(commandsArray.length / 10) - 1 ? ButtonStyle.Secondary : ButtonStyle.Primary)
//                      .setDisabled(pageNumber === Math.ceil(commandsArray.length / 10) - 1) // Disable next button on last page
//                );
//             embed.addComponents(row);
//          }

//          return embed;
//       };

//       let pageNumber = 0;
//       const initialEmbed = createPageEmbed(pageNumber);

//       const message = await interaction.reply({ embeds: [initialEmbed], ephemeral: true, fetchReply: true }); // Fetch reply for button interaction

//       const collector = message.createMessageComponentCollector({ time: 30000 }); // Set a timeout for button interaction

//       collector.on('collect', async (buttonInteraction) => {
//          if (!buttonInteraction.isButton()) return;
//          await buttonInteraction.deferUpdate(); // Acknowledge button interaction

//          if (buttonInteraction.customId === 'prev_page') {
//             pageNumber = Math.max(pageNumber - 1, 0); // Ensure we don't go below page 0
//          } else if (buttonInteraction.customId === 'next_page') {
//             pageNumber = Math.min(pageNumber + 1, Math.ceil(commandsArray.length / 10) - 1); // Ensure we don't go beyond last page
//          }

//          const updatedEmbed = createPageEmbed(pageNumber);
//          await buttonInteraction.editReply({ embeds: [updatedEmbed] });
//       });

//       collector.on('end', () => {
//          const row = new ActionRowBuilder().setComponents([]);
//          message.edit({ components: row });
//       });
//    },
// };