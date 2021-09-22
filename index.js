// Dependencies
const Discord = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Trip = require('./config/trip-schema');

// Connect to MongoDB
mongoose.connect(process.env.DBCONNECTION, () => {
    console.log('Register connected to MongoDB!');
});

// Launch instance of Discord
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'GUILD_MEMBER', 'REACTION', 'USER']
});

// Prefix
const prefix = 'r.';

// Create collection of commands
client.commands = new Collection();

// Check for correct filetype (JavaScript) and require command files when running given command
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Log launch, set status
client.once('ready', () => {
    console.log('Register is online!');
    client.user.setActivity('Kieran lose his mind', { type: 'WATCHING' });
});

/*
// Check to make sure a message starts with the r. prefix, and that it's not sent by a bot
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.author.id !== '373272898368176129') return; // Note: added check, return if not sent by me -Edward

    // Identify arguments by a space in the command and properly format
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        client.commands.get('ping').execute(message, args);
    } else if (command === 'trip') {
        client.commands.get('trip').execute(message, args);
    }
}).on('error', () => {
    console.log(error);
});

 */

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

// ****************************** REACTION LISTENERS ******************************

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

    Trip.findOne({ tripMessageId: reaction.message.id }).then((currentTrip) => {
        if (reaction.emoji.name === currentTrip.tripEmoji) {
            reaction.message.guild.members.fetch(user.id).then(member => {
                member.roles.add(currentTrip.tripRoleId);
            });
        }
    });
});

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

    Trip.findOne({ tripMessageId: reaction.message.id }).then((currentTrip) => {
        if (reaction.emoji.name === currentTrip.tripEmoji) {
            reaction.message.guild.members.fetch(user.id).then(member => {
                member.roles.remove(currentTrip.tripRoleId);
            });
        }
    });
});

/*

// Kieran #trip-planning messages

// Fetch Kieran's Monterey/Sausalito message
client.on('ready', () => {
    client.channels.cache.get('831195262462328849').messages.fetch('856052242511560714');
});

// Fetch Kieran's fishing/airsoft/movie trip message
client.on('ready', () => {
    client.channels.cache.get('831195262462328849').messages.fetch('856056355005792296');
});

// Listen for reactions to both of Kieran's messages
client.on('messageReactionAdd', async (reaction, user) => {
    const message = reaction.message;
    const emoji = reaction.emoji;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    if (message.id === '856052242511560714') {
        if (emoji.name === '🦦') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.add('856077139824345109'); // trip_monterey role
                console.log('Gave trip_monterey role.');
            });
        } else if (emoji.name === '🌉') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.add('856077301561032715'); // trip_sausalito role
                console.log('Gave trip_sausalito role.');
            });
        }
    } else if (message.id === '856056355005792296') {
        if (emoji.name === '🎣') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.add('856078458769244170'); // trip_fishing role
                console.log('Gave trip_fishing role.');
            });
        } else if (emoji.name === '🔫') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.add('856078460572532776'); // trip_airsoft role
                console.log('Gave trip_airsoft role.');
            });
        } else if (emoji.name === '🎥') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.add('856078522694631424'); // trip_movie role
                console.log('Gave trip_movie role.');
            });
        }
    }
});

// Listen for reaction removals
client.on('messageReactionRemove', async (reaction, user) => {
    const message = reaction.message;
    const emoji = reaction.emoji;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            return;
        }
    }

    if (message.id === '856052242511560714') {
        if (emoji.name === '🦦') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.remove('856077139824345109'); // trip_monterey role
                console.log('Removed trip_monterey role.');
            });
        } else if (emoji.name === '🌉') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.remove('856077301561032715'); // trip_sausalito role
                console.log('Removed trip_sausalito role.');
            });
        }
    } else if (message.id === '856056355005792296') {
        if (emoji.name === '🎣') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.remove('856078458769244170'); // trip_fishing role
                console.log('Removed trip_fishing role.');
            });
        } else if (emoji.name === '🔫') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.remove('856078460572532776'); // trip_airsoft role
                console.log('Removed trip_airsoft role.');
            });
        } else if (emoji.name === '🎥') {
            message.guild.members.fetch(user.id).then(member => {
                member.roles.remove('856078522694631424'); // trip_movie role
                console.log('Removed trip_movie role.');
            });
        }
    }
});
*/

// Login to the bot
client.login(process.env.TOKEN);
