// Dependencies
import { Client, Collection, Intents } from 'discord.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import Event from './schemas/event-schema.js';

// Commands
import * as commands from './commands.js';

// Load environment variables
if (process.env.ENV !== 'PROD')
    config();

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION, () => {
    console.log('Register connected to MongoDB!');
});

// Launch instance of Discord
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'GUILD_MEMBER', 'REACTION', 'USER']
});

// Create collection of commands
client.commands = new Collection();

for (const command of commands.default)
    client.commands.set(command.data.name, command);

// Log launch, set status
client.once('ready', () => {
    console.log('Register is online!');
    client.user.setActivity('/event | v0.7.0', { type: 'LISTENING' });
});

// Listens for new servers, might do something with this later
client.on('guildCreate', (guild) => {
    console.log(`Joined a new server: ${guild.id}`);
});

// Interaction listener for slash commands
client.on('interactionCreate', async interaction => {
    // console.log(interaction);

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        });
    }
});

// Reply to being pinged with GIF
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (message.content.includes('@here') || message.content.includes('@everyone') || message.type === 'REPLY') return;
    if (message.mentions.has(client.user.id)) {
        message.channel.send('https://c.tenor.com/Jf-_xbLhAEYAAAAC/discord-valorant.gif');
    }
});

// ****************************** REACTION LISTENERS ******************************

// Message reaction listener
client.on('messageReactionAdd', async (reaction, user) => {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
            // console.log(reaction.message.id);
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // Check to see if a reaction is on an event message; if it is, add the event role to the user reacting
    Event.findOne({ eventMessageId: reaction.message.id }).then((currentEvent) => {
        if (currentEvent)
            if (reaction.emoji.name === currentEvent.eventEmoji) {
                reaction.message.guild.members.fetch(user.id).then(member => {
                    // Ignore event message reactions if by a bot
                    if (!member.user.bot)
                        member.roles.add(currentEvent.eventRoleId);
                });
            }
    });
});

// Message reaction removal listener
client.on('messageReactionRemove', async (reaction, user) => {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    // Check to see if a reaction is on an event message; if it is, remove the event role from the user reacting
    Event.findOne({ eventMessageId: reaction.message.id }).then((currentEvent) => {
        if (currentEvent)
            if (reaction.emoji.name === currentEvent.eventEmoji)
                reaction.message.guild.members.fetch(user.id).then(member => {
                    member.roles.remove(currentEvent.eventRoleId);
                });
    });
});

// Login to the bot
client.login(process.env.BOT_TOKEN);
