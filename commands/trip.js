const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trip')
        .setDescription('Tool for managing Costco trips')
        .addSubcommand(helpSubcommand =>
            helpSubcommand
                .setName('help')
                .setDescription('Displays trip planning help'))
        .addSubcommand(addSubcommand =>
            addSubcommand
                .setName('add')
                .setDescription('Create a new trip')
                .addStringOption(tripName =>
                    tripName
                        .setName('name')
                        .setDescription('The name of the trip; best if named by location')
                        .setRequired(true))
                .addStringOption(tripDate =>
                    tripDate
                        .setName('date')
                        .setDescription('The date of the trip; can be specific or arbitrary')
                        .setRequired(true))
                .addStringOption(tripEmoji =>
                    tripEmoji
                        .setName('emoji')
                        .setDescription('A unique emoji for the trip')
                        .setRequired(true)))
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

        if (interaction.options.getSubcommand() === 'help') {
            const tripHelpEmbed = new Discord.MessageEmbed()
                .setColor('#ff0cff')
                .setTitle('Costco trip command')
                .setDescription('Used to create new trips and roles we can track/mention')
                .addField('add', '/trip add [name of trip] [date] [trip emoji]', false)
                .addField('reschedule', '/trip reschedule [trip emoji] [date]', false)
                .addField('cancel', '/trip cancel [trip emoji]', false);
            await interaction.reply({ embeds: [tripHelpEmbed] });
        } else if (interaction.options.getSubcommand() === 'add') {
            // Dependencies
            const Discord = require('discord.js');
            const mongoose = require('mongoose');
            const Trip = require('../config/trip-schema');
            global.fetch = require('node-fetch');
            const unsplash = require('unsplash-js').createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

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
                    const newTripEmbed = new Discord.MessageEmbed()
                        .setColor('#ff0cff')
                        .setTitle('New Costco trip')
                        .setDescription('React to this message to be given the associated role!')
                        .setThumbnail(results[0].urls.regular)
                        .addField('Where:', interaction.options.getString('name'), false)
                        .addField('When:', interaction.options.getString('date'), false)
                        .setFooter('Image by ' + results[0].user.name + ' on Unsplash');
                    interaction.reply({ embeds: [newTripEmbed] }).then(async (newTripInteraction) => {
                        const newTripMsg = await interaction.fetchReply();
                        // console.log(newTripMsg);
                        interaction.guild.roles.create({ name: '[Trip] ' + interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                            .then((newTripRole) => {
                                new Trip({
                                    tripName: interaction.options.getString('name'),
                                    tripDate: interaction.options.getString('date'),
                                    tripEmoji: interaction.options.getString('emoji'),
                                    tripMessageId: newTripMsg.id,
                                    tripRoleId: newTripRole.id
                                }).save().then((newTrip) => {
                                    newTripMsg.react(newTrip.tripEmoji);
                                });
                            });
                    });
                }
            });
        } else if (interaction.options.getSubcommand() === 'reschedule') {
            // Dependencies
            const Discord = require('discord.js');
            const mongoose = require('mongoose');
            const Trip = require('../config/trip-schema');

            await Trip.updateOne({ tripEmoji: interaction.options.getString('emoji') }, { tripDate: interaction.options.getString('date') });
            await Trip.findOne({ tripEmoji: interaction.options.getString('emoji') }).then((currentTrip) => {

                interaction.channel.messages.fetch(currentTrip.tripMessageId).then((currentTripMsg) => {
                    // console.log(currentTripMsg);

                    const newTripEmbed = new Discord.MessageEmbed()
                        .setColor('#ff0cff')
                        .setTitle('New Costco trip')
                        .setDescription('React to this message to be given the associated role!')
                        .setThumbnail(currentTripMsg.embeds[0].thumbnail.url)
                        .addField('Where:', currentTrip.tripName, false)
                        .addField('When:', currentTrip.tripDate, false)
                        .setFooter(currentTripMsg.embeds[0].footer.text);
                    currentTripMsg.edit({ embeds: [newTripEmbed] });
                });

                interaction.reply('Trip rescheduled! Check the original message for the new details.');

            });
        } else if (interaction.options.getSubcommand() === 'cancel') {
            // Dependencies
            const Discord = require('discord.js');
            const mongoose = require('mongoose');
            const Trip = require('../config/trip-schema');

            await Trip.findOne({ tripEmoji: interaction.options.getString('emoji') }).then((currentTrip) => {

                interaction.channel.messages.fetch(currentTrip.tripMessageId).then((currentTripMsg) => {
                    // console.log(currentTripMsg);

                    const newTripEmbed = new Discord.MessageEmbed()
                        .setColor('#ff0cff')
                        .setTitle('[Canceled trip]')
                        .setDescription('This trip was canceled :(')
                        .setThumbnail(currentTripMsg.embeds[0].thumbnail.url)
                        .addField('Where:', currentTrip.tripName, false)
                        .addField('Was scheduled for:', currentTrip.tripDate, false)
                        .setFooter(currentTripMsg.embeds[0].footer.text);
                    currentTripMsg.edit({ embeds: [newTripEmbed] });
                });

                interaction.guild.roles.cache.get(currentTrip.tripRoleId).delete();

            });

            await Trip.deleteOne({ tripEmoji: interaction.options.getString('emoji') });
            await interaction.reply('Trip canceled; the original message was edited accordingly :(');

        }
    }
};
