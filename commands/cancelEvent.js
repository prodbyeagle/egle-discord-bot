require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getDatabase } = require('../commands/func/connectDB');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('cancel')
      .setDescription('Cancels the current active event')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   async execute(interaction) {
      try {
         const database = await getDatabase();
         const events = database.collection('events');

         const activeEvent = await events.findOne({ active: true });

         if (!activeEvent) {
            await interaction.reply({ content: 'There is no active event to cancel.', ephemeral: true });
         } else {
            await events.updateOne({ _id: activeEvent._id }, { $set: { active: false } });
            await interaction.reply({ content: `Event "${activeEvent.name}" has been cancelled.`, ephemeral: true });
         }
      } catch (error) {
         console.error('Error cancelling event:', error);
         await logError(client, error, 'cancelEvent');
         await interaction.reply({ content: 'There was an error while cancelling the event.', ephemeral: true });
      }
   }
};