require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri)

module.exports = {
   data: new SlashCommandBuilder()
      .setName('level')
      .setDescription('Shows your level and XP'),
   async execute(interaction) {
      await client.connect();
      const database = client.db('EGLEDB');
      const users = database.collection('users');

      const userId = interaction.user.id;
      let user = await users.findOne({ userId });

      if (!user) {
         user = { userId, xp: 0, level: 0 };
         await users.insertOne(user);
      }

      const embed = new EmbedBuilder()
         .setTitle(`${interaction.user.username}'s Level`)
         .addFields(
            { name: 'Level', value: user.level.toString(), inline: true },
            { name: 'XP', value: user.xp.toString(), inline: true }
         )
         .setColor('Random');

      await interaction.reply({ embeds: [embed], ephemeral: true });
      await client.close();
   }
};