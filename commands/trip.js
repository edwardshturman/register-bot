const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()

        // Base trip command
        .setName('trip')
        .setDescription('Tool for planning and managing trips')
        .addSubcommand(helpSubcommand =>
            helpSubcommand
                .setName('help')
                .setDescription('Display trip planning help'))

        // Add subcommand
        .addSubcommand(addSubcommand =>
            addSubcommand
                .setName('add')
                .setDescription('Create a new trip')
                .addStringOption(tripName =>
                    tripName
                        .setName('name')
                        .setDescription('The name of the trip; best if named by location')
                        .setRequired(true))
                .addStringOption(tripEmoji =>
                    tripEmoji
                        .setName('emoji')
                        .setDescription('A unique emoji for the trip')
                        .setRequired(true))
                .addStringOption(tripDate =>
                    tripDate
                        .setName('date')
                        .setDescription('The date of the trip; can be specific or arbitrary')
                        .setRequired(true))
                .addStringOption(tripDate2 =>
                    tripDate2
                        .setName('date2')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate3 =>
                    tripDate3
                        .setName('date3')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate4 =>
                    tripDate4
                        .setName('date4')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate5 =>
                    tripDate5
                        .setName('date5')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate6 =>
                    tripDate6
                        .setName('date6')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate7 =>
                    tripDate7
                        .setName('date7')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate8 =>
                    tripDate8
                        .setName('date8')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false))
                .addStringOption(tripDate9 =>
                    tripDate9
                        .setName('date9')
                        .setDescription('Another potential date for the trip')
                        .setRequired(false)))

        // Reschedule subcommand
        .addSubcommand(resceduleSubcommand =>
            resceduleSubcommand
                .setName('reschedule')
                .setDescription('Reschedule a trip')
                .addStringOption(tripEmoji =>
                    tripEmoji
                        .setName('emoji')
                        .setDescription('The unique emoji for the trip')
                        .setRequired(true))
                .addStringOption(tripDate =>
                    tripDate
                        .setName('date')
                        .setDescription('The new date for the trip')
                        .setRequired(true)))

        // Cancel subcommand
        .addSubcommand(cancelSubcommand =>
            cancelSubcommand
                .setName('cancel')
                .setDescription('Cancel a trip :(')
                .addStringOption(tripEmoji =>
                    tripEmoji
                        .setName('emoji')
                        .setDescription('The unique emoji for the trip')
                        .setRequired(true))),

    async execute (interaction) {
        // Dependencies
        const Discord = require('discord.js');

        // On /trip help, display trip command help
        if (interaction.options.getSubcommand() === 'help') {
            const tripHelpEmbed = new Discord.MessageEmbed()
                .setColor('#ff0cff')
                .setTitle('Trip command')
                .setDescription('Used to create new trips and roles we can track/mention')
                .addField('add', '/trip add [name of trip] [date] [trip emoji]', false)
                .addField('reschedule', '/trip reschedule [trip emoji] [date]', false)
                .addField('cancel', '/trip cancel [trip emoji]', false);
            await interaction.reply({ embeds: [tripHelpEmbed] });

        // Execute /trip add
        } else if (interaction.options.getSubcommand() === 'add') {
            // Dependencies
            const Discord = require('discord.js');
            require('mongoose');
            const Trip = require('../config/trip-schema');
            global.fetch = require('node-fetch');
            const unsplash = require('unsplash-js').createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

            // Search for an existing trip emoji and return if it exists
            Trip.findOne({ tripEmoji: interaction.options.getString('emoji') }).then((tripExists) => {
                if (tripExists) {
                    interaction.reply('This trip already exists! Try a different emoji.');
                } else if (!tripExists) {

                    // Fetch thumbnail from Unsplash
                    unsplash.search.getPhotos({
                        query: interaction.options.getString('name'),
                        page: 1,
                        perPage: 10,
                        orderBy: 'relevant'
                    }).then(result => {
                        if (result.errors) {
                            interaction.reply('Encountered an error fetching a thumbnail (check bot console)! To avoid confusion, trip was not created in database.');
                            console.log(result.errors[0]);
                        } else {
                            const feed = result.response;
                            const { results } = feed;

                            // Create newTripEmbed using trip name, date, and Unsplash thumbnail with author info
                            const newTripEmbed = new Discord.MessageEmbed()
                                .setColor('#ff0cff')
                                .setTitle('New trip: ' + interaction.options.getString('name'))
                                .setDescription('React to this message to be given the associated role!')
                                .setThumbnail(results[0].urls.regular)
                                .addField('When:', interaction.options.getString('date'), false)
                                .setFooter('Image by ' + results[0].user.name + ' on Unsplash');

                            // Send newTripEmbed, get message ID through newTripMsg
                            interaction.reply({ embeds: [newTripEmbed] }).then(async (newTripInteraction) => {
                                const newTripMsg = await interaction.fetchReply();

                                // Create a role for the trip using the trip name and unique emoji
                                interaction.guild.roles.create({ name: '[Trip] ' + interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                                    .then((newTripRole) => {

                                        // Create a trip in MongoDB using the trip name, date, unique emoji, newTripEmbed message ID, and the trip role ID
                                        new Trip({
                                            tripName: interaction.options.getString('name'),
                                            tripDate: interaction.options.getString('date'),
                                            tripEmoji: interaction.options.getString('emoji'),
                                            tripMessageId: newTripMsg.id,
                                            tripRoleId: newTripRole.id
                                        }).save().then((newTrip) => {

                                            // React to the newTripEmbed with the trip unique emoji
                                            newTripMsg.react(newTrip.tripEmoji);
                                        });
                                    });
                            });
                        }
                    });
                }
            });

        // Execute /trip reschedule
        } else if (interaction.options.getSubcommand() === 'reschedule') {
            // Dependencies
            const Discord = require('discord.js');
            require('mongoose');
            const Trip = require('../config/trip-schema');

            // Using unique trip emoji, find trip and pass currentTrip to use for editing original newTripEmbed
            await Trip.findOne({ tripEmoji: interaction.options.getString('emoji') }).then(async (currentTrip) => {

                // Check if trip exists using unique emoji, ignore if it doesn't
                if (!currentTrip) {
                    await interaction.reply('Couldn\'t find that trip! Try a different emoji.');
                } else if (currentTrip) {

                    // Using unique trip emoji, find trip and change date
                    await Trip.updateOne({ tripEmoji: interaction.options.getString('emoji') }, { tripDate: interaction.options.getString('date') });

                    // Search for newTripEmbed message in channel where /trip reschedule command is used
                    await interaction.channel.messages.fetch(currentTrip.tripMessageId).then((currentTripMsg) => {

                        if (!currentTripMsg) {
                            interaction.reply('Couldn\'t find that trip! Try searching in the channel where it was created.');
                        } else if (currentTripMsg) {

                            // Edit original newTripEmbed
                            const newTripEmbed = new Discord.MessageEmbed()
                                .setColor('#ff0cff')
                                .setTitle('New trip: ' + currentTrip.tripName)
                                .setDescription('React to this message to be given the associated role!')
                                .setThumbnail(currentTripMsg.embeds[0].thumbnail.url)
                                .addField('When:', currentTrip.tripDate, false)
                                .setFooter(currentTripMsg.embeds[0].footer.text);
                            currentTripMsg.edit({ embeds: [newTripEmbed] });
                        }
                    });

                    await interaction.reply('Trip rescheduled! Check the original message for the new details.');

            }});

        // Execute /trip cancel
        } else if (interaction.options.getSubcommand() === 'cancel') {
            // Dependencies
            const Discord = require('discord.js');
            require('mongoose');
            const Trip = require('../config/trip-schema');

            // Using unique trip emoji, find trip and pass currentTrip to use for editing original newTripEmbed
            await Trip.findOne({ tripEmoji: interaction.options.getString('emoji') }).then(async (currentTrip) => {

                // Check if trip exists using unique emoji, ignore if it doesn't
                if (!currentTrip) {
                    await interaction.reply('Couldn\'t find that trip! Try a different emoji.');
                } else if (currentTrip) {

                    // Search for newTripEmbed message in channel where /trip cancel command is used
                    await interaction.channel.messages.fetch(currentTrip.tripMessageId).then((currentTripMsg) => {

                        if (!currentTripMsg) {
                            interaction.reply('Couldn\'t find that trip! Try searching in the channel where it was created.');
                        } else if (currentTripMsg) {

                            // Edit original newTripEmbed
                            const newTripEmbed = new Discord.MessageEmbed()
                                .setColor('#ff0cff')
                                .setTitle('[Canceled trip]')
                                .setDescription('This trip was canceled :(')
                                .setThumbnail(currentTripMsg.embeds[0].thumbnail.url)
                                .addField('Where:', currentTrip.tripName, false)
                                .addField('Was scheduled for:', currentTrip.tripDate, false)
                                .setFooter(currentTripMsg.embeds[0].footer.text);
                            currentTripMsg.edit({ embeds: [newTripEmbed] });
                        }
                    });

                    // Delete trip role
                    await interaction.guild.roles.cache.get(currentTrip.tripRoleId).delete();

                    // Find trip using unique emoji and delete from MongoDB
                    await Trip.deleteOne({ tripEmoji: interaction.options.getString('emoji') });
                    await interaction.reply('Trip canceled; the original message was edited accordingly :(');

                }
            });
        }
    }
};
