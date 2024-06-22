const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { setTimeout } = require('timers/promises');
const { logError } = require('./func/error');
const { saveGiveaways, connectToDatabase, clearEndedGiveaways } = require('./func/connectDB');

const giveaways = new Map();
const GIVEAWAY_CHANNEL_ID = '1243704233757380738';

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
            .addIntegerOption(option =>
               option.setName('winners')
                  .setDescription('Number of winners for the giveaway')
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
      try {
         const subcommand = interaction.options.getSubcommand();

         if (!interaction.client.db) {
            await connectToDatabase();
         }

         if (subcommand === 'start') {
            const prize = interaction.options.getString('prize');
            const duration = interaction.options.getInteger('duration');
            const winnersCount = interaction.options.getInteger('winners');

            const endTime = Date.now() + duration * 60000;
            const endTimestamp = Math.floor(endTime / 1000);

            const embed = new EmbedBuilder()
               .setTitle('🎉 New Giveaway! 🎉')
               .setDescription(`Prize: **${prize}**\nNumber of winners: **${winnersCount}**\nEnds <t:${endTimestamp}:R>.\nEntered: 0 users`)
               .setColor('Yellow')
               .setTimestamp(endTime)
               .setFooter({ text: '🦅 made by @prodbyeagle' });

            const row = new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                     .setCustomId('enter_giveaway')
                     .setLabel(`Giveaway ${prize}`)
                     .setStyle(ButtonStyle.Primary)
               );

            const giveawayChannel = await interaction.client.channels.fetch(GIVEAWAY_CHANNEL_ID);
            const message = await giveawayChannel.send({ embeds: [embed], components: [row] });

            giveaways.set(message.id, { prize, endTime, participants: new Set(), winnersCount, messageId: message.id });

            await saveGiveaways(giveaways);
            await interaction.reply({ content: `Giveaway started in <#${GIVEAWAY_CHANNEL_ID}>`, ephemeral: true });

            await setTimeout(duration * 60000);
            await endGiveaway(message.id, interaction.client);

         } else if (subcommand === 'enter') {
            const activeGiveaway = [...giveaways.values()].find(g => g.endTime > Date.now());

            if (!activeGiveaway) {
               return interaction.reply({ content: 'There is no active giveaway to enter.', ephemeral: true });
            }

            activeGiveaway.participants.add(interaction.user.id);
            await saveGiveaways(giveaways);
            return interaction.reply({ content: 'You have been entered into the giveaway!', ephemeral: true });

         } else if (subcommand === 'end') {
            const activeGiveaway = [...giveaways.values()].find(g => g.endTime > Date.now());

            if (!activeGiveaway) {
               return interaction.reply({ content: 'There is no active giveaway to end.', ephemeral: true });
            }

            await endGiveaway(activeGiveaway.messageId, interaction.client);
            await saveGiveaways(giveaways);
            return interaction.reply({ content: 'The giveaway has been ended and winners have been selected.', ephemeral: true });
         }
      } catch (error) {
         await logError(interaction.client, error, `Error executing giveaway command: ${interaction.options.getSubcommand()}`);
         await interaction.reply({ content: `There was an error while executing the command: ${error.message}`, ephemeral: true });
      }
   },
   giveaways
};

async function endGiveaway(messageId, client) {
   try {
      const giveaway = giveaways.get(messageId);
      if (!giveaway) return;

      const participants = Array.from(giveaway.participants);
      if (participants.length === 0) {
         const embed = new EmbedBuilder()
            .setTitle('🎉 Giveaway Ended! 🎉')
            .setDescription(`Prize: **${giveaway.prize}**\nNo participants entered the giveaway.`)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: 'Giveaway ended at' });

         const giveawayChannel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);
         const message = await giveawayChannel.messages.fetch(giveaway.messageId);
         await message.edit({ embeds: [embed], components: [] });

         giveaways.delete(messageId);
         await clearEndedGiveaways();
         await saveGiveaways(giveaways);
         return;
      }

      const winners = [];
      for (let i = 0; i < giveaway.winnersCount; i++) {
         if (participants.length === 0) break;
         const winnerIndex = Math.floor(Math.random() * participants.length);
         winners.push(participants.splice(winnerIndex, 1)[0]);
      }

      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
      const endEmbed = new EmbedBuilder()
         .setTitle('🎉 Giveaway Ended! 🎉')
         .setDescription(`Prize: **${giveaway.prize}**\nWinners: ${winnerMentions}\nEntered: ${giveaway.participants.size} users`)
         .setColor('Green')
         .setTimestamp()
         .setFooter({ text: '🦅 made by @prodbyeagle' });

      const giveawayChannel = await client.channels.fetch(GIVEAWAY_CHANNEL_ID);
      const message = await giveawayChannel.messages.fetch(giveaway.messageId);
      await message.edit({ embeds: [endEmbed], components: [] });

      await message.react('👍');
      await message.react('👎');

      giveaways.delete(messageId);
      await saveGiveaways(giveaways);
   } catch (error) {
      await logError(client, error, `Error ending giveaway with message ID: ${messageId}`);
   }
}
