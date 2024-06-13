const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const { logError } = require('./func/error');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('event')
      .setDescription('Shows the current active event'),
   async execute(interaction) {
      try {
         await client.connect();
         const database = client.db('EGLEDB');
         const events = database.collection('events');

         const activeEvent = await events.findOne({ active: true });

         if (!activeEvent) {
            await interaction.reply({ content: 'There is no active event currently.', ephemeral: true });
         } else {
            const eventStartTime = Math.floor(activeEvent.createdAt.getTime() / 1000); // Event start time in Unix timestamp
            const eventEndTime = eventStartTime + (activeEvent.duration * 3600); // Event end time in Unix timestamp

            const embed = new EmbedBuilder()
               .setTitle(`Active Event: ${activeEvent.name}`)
               .setDescription(activeEvent.desc)
               .addFields(
                  {
                     name: 'Multiplier', value: `${activeEvent.multiplier.toString()}x`, inline: true },
                  { name: 'Duration', value: `${activeEvent.duration} hours`, inline: true },
                  { name: 'Started At', value: `<t:${eventStartTime}:R>`, inline: true },
                  { name: 'Remaining Time', value: `<t:${eventEndTime}:R>`, inline: true }
               )
               .setColor('Random')
               .setTimestamp()
               .setFooter({ text: '🦅 made by @prodbyeagle' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
         }
      } catch (error) {
         await logError(client, error, 'Event');
         await interaction.reply({ content: 'There was an error while fetching the active event.', ephemeral: true });
      } finally {
         await client.close();
      }
   }
};