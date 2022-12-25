import { SlashCommandBuilder } from '@discordjs/builders';
import * as Discord from 'discord.js';

const bugCommand = {
    data: new SlashCommandBuilder()
        .setName('bug')
        .setDescription('Report a bug (for admins only)')
        .addStringOption(feature => feature
            .setName('feature')
            .setDescription('Which feature is the bug related to?')
            .setChoices(
                { name: 'General', value: 'general' },
                { name: 'Adding an event', value: 'eventAdd' },
                { name: 'Rescheduling an event', value: 'eventReschedule' },
                { name: 'Renaming an event', value: 'eventRename' },
                { name: 'Cancelling an event', value: 'eventCancel' }
            )
            .setRequired(true))
        .addStringOption(description => description
            .setName('description')
            .setDescription('Please describe the bug in detail')
            .setRequired(true)),

    async execute (interaction) {
        // If the user does not have Manage Server permissions, return
        if (!interaction.member.permissions.has('MANAGE_GUILD'))
            return await interaction.reply({ content: 'Sorry, this command is intended for admins only. Please ask one to disable it for others.' });

        // Create an embed for the bug report
        const embed = new Discord.MessageEmbed()
            .setColor('#42a3ef')
            .setTitle('Register Bug Report')
            .setDescription('**Details:**')
            .addFields(
                { name: 'Reported by', value: interaction.user.tag, inline: false },
                { name: 'Feature', value: interaction.options.getString('feature'), inline: false },
                { name: 'Description', value: interaction.options.getString('description'), inline: false }
            )
            .setThumbnail('https://raw.githubusercontent.com/edwardshturman/register-bot/master/assets/register-logo-circle.png')
            .setTimestamp();

        // Send the embed to the bug reports channel in the dev server
        const channel = interaction.client.guilds.cache.get(process.env.DEV_SERVER_ID).channels.cache.get(process.env.REPORTS_CHANNEL_ID);
        await channel.send({ embeds: [embed] });

        // Send a confirmation message to the user
        await interaction.reply({ content: 'Your bug report has been sent. Thank you!', ephemeral: true });
    }
};

export default bugCommand;
