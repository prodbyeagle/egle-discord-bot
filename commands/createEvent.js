require('dotenv').config();
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getDatabase } = require('../commands/func/connectDB');
const { logError } = require('./func/error');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('create')
      .setDescription('Create a new XP boost event')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addStringOption(option =>
         option.setName('name')
            .setDescription('The name of the event')
            .setRequired(true))
      .addStringOption(option =>
         option.setName('desc')
            .setDescription('The description of the event')
            .setRequired(true))
      .addNumberOption(option =>
         option.setName('multiplier')
            .setDescription('The XP multiplier for the event')
            .setRequired(true))
      .addIntegerOption(option =>
         option.setName('duration')
            .setDescription('The duration of the event in hours')
            .setRequired(true)),
   async execute(interaction) {
      try {
         const database = await getDatabase();
         const events = database.collection('events');

         const name = interaction.options.getString('name');
         const desc = interaction.options.getString('desc');
         const multiplier = interaction.options.getNumber('multiplier');
         const duration = interaction.options.getInteger('duration');

         const event = {
            name,
            desc,
            multiplier,
            duration,
            active: true,
            createdAt: new Date()
         };

         await events.updateMany({ active: true }, { $set: { active: false } });

         await events.insertOne(event);

         const embed = new EmbedBuilder()
            .setTitle(`New Event: ${name}`)
            .setDescription(desc)
            .addFields(
               { name: 'Multiplier', value: multiplier.toString(), inline: true },
               { name: 'Duration', value: `${duration} hours`, inline: true }
            )
            .setColor('Random')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
         console.error('Error creating event:', error);
         await logError(null, error, 'create'); // Null übergeben, da keine spezifische Client-Instanz verwendet wird
         await interaction.reply({ content: 'There was an error while creating the event.', ephemeral: true });
      }
   }
};