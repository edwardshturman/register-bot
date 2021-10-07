// Dependencies
require('@discordjs/builders');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

// Create commands array and identify commands by JS file type in ./commands/
const commands = [];
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

// Push commands to commands array, for each command in ./commands/
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

// Deploy slash commands
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Production environment, deploy commands globally
        if (process.env.ENV === 'PROD') {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENTID),
                { body: commands }
            );

        // Development environment, deploy commands to test server
        } else if (process.env.ENV === 'DEV') {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID),
                { body: commands }
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
