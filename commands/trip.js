module.exports = {
    name: 'trip',
    description: 'Trip command',
    execute (message, args) {

        // Dependencies
        const Discord = require('discord.js');
        const mongoose = require('mongoose');
        const Trip = require('../config/trip-schema');


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
                            new Trip ({
                                tripName: args[1],
                                tripDate: args[2],
                                tripEmoji: args[3],
                                tripPlanningLink: args[4]
                            }).save().then((newTrip) => {
                                message.channel.send('New trip: ' + newTrip).then((newTripMsg) => {
                                    newTripMsg.react(newTrip.tripEmoji);
                                });
                            });
                        } else if (!args[4]) { // If no trip planning link
                            new Trip ({
                                tripName: args[1],
                                tripDate: args[2],
                                tripEmoji: args[3]
                            }).save().then((newTrip) => {
                                message.channel.send('New trip: ' + newTrip).then((newTripMsg) => {
                                    newTripMsg.react(newTrip.tripEmoji);
                                });
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
