const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const giveaways = new Map();

module.exports = {
   data: new SlashCommandBuilder()
      .setName('giveaway')
      .setDescription('Manage giveaways')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addSubcommand(subcommand =>
         subcommand
            .setName('start')
            .setDescription('Start a new giveaway')
            .addStringOption(option =>
               option.setName('prize')
                  .setDescription('The prize for the giveaway')
                  .setRequired(true)
            )
            .addIntegerOption(option =>
               option.setName('duration')
                  .setDescription('Duration of the giveaway in minutes')
                  .setRequired(true)
            )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('enter')
            .setDescription('Enter the current giveaway')
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('end')
            .setDescription('End the current giveaway and pick a winner')
      ),
   async execute(interaction) {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'start') {
         const prize = interaction.options.getString('prize');
         const duration = interaction.options.getInteger('duration');

         const endTime = Date.now() + duration * 60000; // Dauer in Millisekunden
         const endTimestamp = Math.floor(endTime / 1000); // Umrechnung in Sekunden für Discord-Timestamp

         const embed = new EmbedBuilder()
            .setTitle('🎉 New Giveaway! 🎉')
            .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nEnds <t:${endTimestamp}:R>.`)
            .setColor('Green')
            .setTimestamp(endTime)
            .setFooter({ text: 'Giveaway ends at' });

         const message = await interaction.reply({ embeds: [embed], fetchReply: true });
         await message.react('🎉');

         giveaways.set(message.id, { prize, endTime, participants: new Set(), messageId: message.id });

      } else if (subcommand === 'enter') {
         const activeGiveaway = [...giveaways.values()].find(g => g.endTime > Date.now());

         if (!activeGiveaway) {
            return interaction.reply({ content: 'There is no active giveaway to enter.', ephemeral: true });
         }

         activeGiveaway.participants.add(interaction.user.id);
         return interaction.reply({ content: 'You have been entered into the giveaway!', ephemeral: true });

      } else if (subcommand === 'end') {
         const activeGiveaway = [...giveaways.values()].find(g => g.endTime > Date.now());

         if (!activeGiveaway) {
            return interaction.reply({ content: 'There is no active giveaway to end.', ephemeral: true });
         }

         const participants = Array.from(activeGiveaway.participants);
         if (participants.length === 0) {
            return interaction.reply({ content: 'No participants in the giveaway.', ephemeral: true });
         }

         const winnerId = participants[Math.floor(Math.random() * participants.length)];
         const winner = await interaction.guild.members.fetch(winnerId);

         const endEmbed = new EmbedBuilder()
            .setTitle('🎉 Giveaway Ended! 🎉')
            .setDescription(`Prize: **${activeGiveaway.prize}**\nWinner: ${winner.user.tag}`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: 'Giveaway ended at' });

         giveaways.delete(activeGiveaway.messageId);

         await interaction.channel.send({ embeds: [endEmbed] });
         return interaction.reply({ content: `The giveaway has ended. The winner is ${winner.user.tag}.`, ephemeral: true });
      }
   }
};