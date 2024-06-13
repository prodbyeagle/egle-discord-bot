const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { logError } = require('./func/error');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = {
   data: new SlashCommandBuilder()
      .setName('resetxp')
      .setDescription('Reset XP for a member')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
      .addUserOption(option =>
         option.setName('member')
            .setDescription('The member whose XP to reset')
            .setRequired(true)),
   async execute(interaction) {
      const member = interaction.options.getMember('member');

      try {
         await client.connect();

         const database = client.db('EGLEDB');
         const users = database.collection('users');

         const result = await users.updateOne(
            { userId: member.id },
            { $set: { xp: 0, level: 0 } }
         );

         const embed = new EmbedBuilder()
            .setColor(0x7289DA)
            .setTitle(`🦅 XP Reset`)
            .setDescription(`Successfully reset XP for ${member.displayName}.`)
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });

         if (result.modifiedCount !== 1) {
            embed.setDescription(`Failed to reset XP for ${member.displayName}.`);
         }

         await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
         await logError(interaction.client, error, 'resetXP');
         const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error')
            .setDescription('There was an error while resetting XP.')
            .setTimestamp()
            .setFooter({ text: '🦅 made by @prodbyeagle' });
         await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } finally {
         await client.close();
      }
   },
};