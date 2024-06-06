const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { giveRndXP } = require('./func/giveRndXP');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givexp')
        .setDescription('Give XP to random Members.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('members')
                .setDescription('Anzahl der Mitglieder')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('totalxp')
                .setDescription('Gesamte XP')
                .setRequired(true)),
    async execute(interaction) {
        const numMembers = interaction.options.getInteger('members');
        const totalXP = interaction.options.getInteger('totalxp');
        const guild = interaction.guild;

        try {
            await giveRndXP(numMembers, totalXP, guild);

            const embed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle('XP Given')
                .setDescription(`Successfully given ${totalXP} XP to ${numMembers} members.`)
                .setTimestamp()
                .setFooter({ text: '🦅 made by @prodbyeagle' });

            if (numMembers <= 0) {
                embed.setDescription('No members were mentioned.');
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error giving XP:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('There was an error while giving XP.')
                .setTimestamp()
                .setFooter({ text: '🦅 made by @prodbyeagle' });
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};