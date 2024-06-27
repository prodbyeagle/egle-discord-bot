const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { giveRndXP } = require('./func/giveRndXP');
const { logError } = require('./func/error');
const _ = require('lodash');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawayxp')
        .setDescription('Give XP to random Members.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('members')
                .setDescription('Number of members')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('totalxp')
                .setDescription('Total XP you want to giveaway')
                .setRequired(true)),
    async execute(interaction) {
        const numMembers = interaction.options.getInteger('members');
        const totalXP = interaction.options.getInteger('totalxp');
        const guild = interaction.guild;

        try {
            // Fetch guild members
            const guildMembers = guild.members.cache.array();

            // Select random members
            const randomMembers = _.sampleSize(guildMembers, numMembers);

            // Array to store usernames
            const usernames = randomMembers.map(member => member.user.username);

            // Give XP to random members
            await giveRndXP(numMembers, totalXP, guild, usernames);

            const embed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle('XP Given')
                .setDescription(`Successfully given ${totalXP} XP to ${numMembers} members.`)
                .setTimestamp()
                .setFooter('🦅 made by @prodbyeagle');

            if (numMembers <= 0) {
                embed.setDescription('No members were mentioned.');
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await logError(client, error, 'giveawayXP');
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('There was an error while giving XP.')
                .setTimestamp()
                .setFooter('🦅 made by @prodbyeagle');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
