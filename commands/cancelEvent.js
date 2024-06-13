const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MongoClient } = require('mongodb');
const { logError } = require('./func/error');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('cancel')
      .setDescription('Cancels the current active event')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   async execute(interaction) {
      try {
         await client.connect();
         const database = client.db('EGLEDB');
         const events = database.collection('events');

         const activeEvent = await events.findOne({ active: true });

         if (!activeEvent) {
            await interaction.reply({ content: 'There is no active event to cancel.', ephemeral: true });
         } else {
            await events.updateOne({ _id: activeEvent._id }, { $set: { active: false } });
            await interaction.reply({ content: `Event "${activeEvent.name}" has been cancelled.`, ephemeral: true });
         }
      } catch (error) {
         await logError(client, error, 'cancelEvent');
         await interaction.reply({ content: 'There was an error while cancelling the event.', ephemeral: true });
      } finally {
         await client.close();
      }
   }
};