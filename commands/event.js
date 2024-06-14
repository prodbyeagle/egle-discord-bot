require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectToDatabase, getDatabase, getActiveEvent } = require('../commands/func/connectDB');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('event')
      .setDescription('Shows the current active event'),
   async execute(interaction) {
      let client;
      try {
         client = await connectToDatabase();
         const database = await getDatabase(client);
         const events = database.collection('events');

         const activeEvent = await getActiveEvent(client);

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
                     name: 'Multiplier', value: `${activeEvent.multiplier.toString()}x`, inline: true
                  },
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
         console.error('Error fetching active event:', error);
         await logError(client, error, 'Event');
         await interaction.reply({ content: 'There was an error while fetching the active event.', ephemeral: true });
      } finally {
         if (client) await client.close();
      }
   }
};