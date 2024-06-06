const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

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
            const embed = new EmbedBuilder()
               .setTitle(`Active Event: ${activeEvent.name}`)
               .setDescription(activeEvent.desc)
               .addFields(
                  { name: 'Multiplier', value: activeEvent.multiplier.toString(), inline: true },
                  { name: 'Duration', value: `${activeEvent.duration} hours`, inline: true },
                  { name: 'Started At', value: activeEvent.createdAt.toLocaleString(), inline: true }
               )
               .setColor('Random')
               .setTimestamp()
               .setFooter({ text: '🦅 made by @prodbyeagle' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
         }
      } catch (error) {
         console.error('Error fetching active event:', error);
         await interaction.reply({ content: 'There was an error while fetching the active event.', ephemeral: true });
      } finally {
         await client.close();
      }
   }
};
