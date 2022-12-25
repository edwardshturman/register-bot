// Dependencies
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { config } from 'dotenv';

// Commands
import * as commandsList from './commands.js';

// Load environment variables
if (process.env.ENV !== 'PROD')
    config();

// Load commands
const commands = [];
for (const command of commandsList.default)
    commands.push(command.data.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

// Deploy slash commands
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Production environment, deploy commands globally
        if (process.env.ENV === 'PROD') {
            // Deploy global commands
            await rest.put(
                Routes.applicationCommands(process.env.BOT_CLIENT_ID),
                { body: commands }
            );

            // Clear guild commands
            await rest.put(
                Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.DEV_SERVER_ID),
                { body: [] }
            );
        }

        // Development environment, deploy commands locally
        else if (process.env.ENV === 'DEV') {
            await rest.put(
                Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.DEV_SERVER_ID),
                { body: commands }
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
