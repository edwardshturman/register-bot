// Dependencies
require('discord.js');
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

// Create collection of commands
client.commands = new Collection();

// Check for correct file type (JavaScript) and require command files when running given command
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Log launch, set status
client.once('ready', () => {
    console.log('Register is online!');
    client.user.setActivity('VALORANT', { type: 'PLAYING' });
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

    // Check to see if a reaction is on a trip message; if it is, add the trip role to the user reacting
    Trip.findOne({ tripMessageId: reaction.message.id }).then((currentTrip) => {
        if (currentTrip) {
            if (reaction.emoji.name === currentTrip.tripEmoji) {
                reaction.message.guild.members.fetch(user.id).then(member => {

                    // Ignore trip message reactions if by a bot
                    if (!member.user.bot) {
                        member.roles.add(currentTrip.tripRoleId);
                    }
                });
            }
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

    // Check to see if a reaction is on a trip message; if it is, remove the trip role from the user reacting
    Trip.findOne({ tripMessageId: reaction.message.id }).then((currentTrip) => {
        if (currentTrip) {
            if (reaction.emoji.name === currentTrip.tripEmoji) {
                reaction.message.guild.members.fetch(user.id).then(member => {
                    member.roles.remove(currentTrip.tripRoleId);
                });
            }
        }
    });
});

// Login to the bot
client.login(process.env.TOKEN);
