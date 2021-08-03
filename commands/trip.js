module.exports = {
    name: 'trip',
    description: 'Trip command',
    execute (message, args) {

        // Dependencies
        const Discord = require('discord.js');
        const mongoose = require('mongoose');
        const Trip = require('../config/trip-schema');

        global.fetch = require('node-fetch');
        const unsplash = require('unsplash-js').createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });


        if (args[0] === 'add') {

            if (!args[1]) { // If no trip name
                message.channel.send('You need to include a name, date, and unique emoji!');
            } else if (args[1]) {
                if (!args[2]) { // If no trip date
                    message.channel.send('You need to include a name, date, and unique emoji!');
                } else if (args[2]) {
                    if (!args[3]) { // If no trip emoji
                        message.channel.send('You need to include a name, date, and unique emoji!');
                    } else if (args[3]) {
                        if (args[4]) {
                            unsplash.search.getPhotos({
                                query: args[1],
                                page: 1,
                                perPage: 10,
                                orderBy: 'relevant'
                            }).then(result => {
                                if (result.errors) {
                                    message.channel.send('Encountered an error fetching a thumbnail (check bot console)! To avoid confusion, trip was not created in database.');
                                    console.log(result.errors[0]);
                                } else {
                                    const feed = result.response;
                                    const { results } = feed;
                                    const newTripEmbed = new Discord.MessageEmbed()
                                        .setColor('#ff0cff')
                                        .setTitle('New Costco trip')
                                        .setDescription('React to this message to be given the associated role!')
                                        .setThumbnail(results[0].urls.regular)
                                        .addField('Where:', args[1], false)
                                        .addField('When:', args[2], false)
                                        .addField('Trip planning page:', args[4], false)
                                        .setFooter('Image by ' + results[0].user.name + ' on Unsplash');
                                    message.channel.send(newTripEmbed).then((newTripMsg) => {
                                            new Trip({
                                                tripName: args[1],
                                                tripDate: args[2],
                                                tripEmoji: args[3],
                                                tripPlanningLink: args[4],
                                                tripMessageId: newTripMsg.id
                                            }).save().then((newTrip) => {
                                                newTripMsg.react(newTrip.tripEmoji);
                                            });
                                    });
                                }
                            });
                        } else if (!args[4]) { // If no trip planning link
                            unsplash.search.getPhotos({
                                query: args[1],
                                page: 1,
                                perPage: 10,
                                orderBy: 'relevant'
                            }).then(result => {
                                if (result.errors) {
                                    message.channel.send('Encountered an error fetching a thumbnail (check bot console)! To avoid confusion, trip was not created in database.');
                                    console.log(result.errors[0]);
                                } else {
                                    const feed = result.response;
                                    const { results } = feed;
                                    const newTripEmbed = new Discord.MessageEmbed()
                                        .setColor('#ff0cff')
                                        .setTitle('New Costco trip')
                                        .setDescription('React to this message to be given the associated role!')
                                        .setThumbnail(results[0].urls.regular)
                                        .addField('Where:', args[1], false)
                                        .addField('When:', args[2], false)
                                        .setFooter('Image by ' + results[0].user.name + ' on Unsplash');
                                    message.channel.send(newTripEmbed).then((newTripMsg) => {
                                        new Trip({
                                            tripName: args[1],
                                            tripDate: args[2],
                                            tripEmoji: args[3],
                                            tripMessageId: newTripMsg.id
                                        }).save().then((newTrip) => {
                                            newTripMsg.react(newTrip.tripEmoji);
                                        });
                                    });
                                }
                            });
                        }
                    }
                }
            }

        } else if (!args[0]) {
            const tripCommandEmbed = new Discord.MessageEmbed()
                .setColor('#ff0cff')
                .setTitle('Costco trip command')
                .setDescription('Used to create new trips and roles we can track/mention')
                .addField('add', 'r.trip add [name of trip] [date] [optional: link to trip planning page]', false)
                .addField('remove', 'r.trip remove [name of trip]', false)
                .addField('reschedule', 'r.trip rs [name of trip] [new date]', false);
            message.channel.send(tripCommandEmbed);

        } else if (args[0] !== 'add') {
            message.channel.send('The command does not yet support trip modification/deletion!');
        }

    }
};
