const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Does exactly what you think it does :)'),
    async execute (interaction) {
        await interaction.reply('Pong!');
    }
};
