import { SlashCommandBuilder } from '@discordjs/builders';
import * as Discord from 'discord.js';
import fetch from 'node-fetch';

const roadmapCommand = {
    data: new SlashCommandBuilder()
        .setName('roadmap')
        .setDescription('Check the Register bot roadmap'),

    async execute (interaction) {
        // Fetch issues from the GitHub repository
        const issues = await fetch('https://api.github.com/repos/edwardshturman/register-bot/issues?state=open').then(response => response.json());

        // Create an embed for each issue
        const embeds = [];
        for (const issue of issues) {
            const embed = new Discord.MessageEmbed()
                .setColor('#42a3ef')
                .setTitle(issue.title)
                .setURL(issue.html_url)
                .setDescription(issue.body || '')
                .setFooter(`${issue.labels.map(label => label.name).join(' // ')}`);
            embeds.push(embed);
        }

        // Send the embeds
        const reply = {};
        if (embeds.length === 0)
            reply.content = 'No Issues found in the repo! Feel free to submit one for a feature request or bug report.';
        else
            reply.embeds = embeds;
        reply.ephemeral = true;
        await interaction.reply(reply);
    }
};

export default roadmapCommand;
