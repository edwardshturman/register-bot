module.exports = {
    name: 'trip',
    description: 'Trip command',
    execute (message, args) {

        // Dependencies
        const Discord = require('discord.js');
        const mongoose = require('mongoose');
        const Trip = require('../config/trip-schema');


        if (args[0] === 'add') {

            new Trip ({
                tripName: args[1],
                tripDate: args[2]
            }).save().then((newTrip) => {
                message.channel.send('New trip: ' + newTrip);
            });

        } else if (!args[0]) {
            const tripCommandEmbed = new Discord.MessageEmbed()
                .setColor('#ff0cff')
                .setTitle('Costco trip command')
                .setDescription('Used to create new trips and roles we can track/mention')
                .addField('add', 'r.trip add <name of trip> <date>', false)
                .addField('remove', 'r.trip remove <name of trip>', false)
                .addField('reschedule', 'r.trip rs <name of trip> <new date>', false);
            message.channel.send(tripCommandEmbed);

        } else if (args[0] !== 'add') {
            message.channel.send('The command does not yet support trip modification/deletion!');
        }

    }
};
