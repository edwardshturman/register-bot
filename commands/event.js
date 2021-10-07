const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()

        // Base event command
        .setName('event')
        .setDescription('Tool for planning and managing events')
        .addSubcommand(helpSubcommand =>
            helpSubcommand
                .setName('help')
                .setDescription('Display event planning help'))

        // Add subcommand
        .addSubcommand(addSubcommand =>
            addSubcommand
                .setName('add')
                .setDescription('Create a new event')
                .addStringOption(eventName =>
                    eventName
                        .setName('name')
                        .setDescription('The name of the event; best if named by location')
                        .setRequired(true))
                .addStringOption(eventEmoji =>
                    eventEmoji
                        .setName('emoji')
                        .setDescription('A unique emoji for the event')
                        .setRequired(true))
                .addStringOption(eventDate =>
                    eventDate
                        .setName('date')
                        .setDescription('The date of the event; can be specific or arbitrary')
                        .setRequired(true))
                .addStringOption(eventDate2 =>
                    eventDate2
                        .setName('date2')
                        .setDescription('Another potential date for the event')
                        .setRequired(false))
                .addStringOption(eventDate3 =>
                    eventDate3
                        .setName('date3')
                        .setDescription('Another potential date for the event')
                        .setRequired(false))
                .addStringOption(eventDate4 =>
                    eventDate4
                        .setName('date4')
                        .setDescription('Another potential date for the event')
                        .setRequired(false)))

        // Reschedule subcommand
        .addSubcommand(resceduleSubcommand =>
            resceduleSubcommand
                .setName('reschedule')
                .setDescription('Reschedule an event')
                .addStringOption(eventEmoji =>
                    eventEmoji
                        .setName('emoji')
                        .setDescription('The unique emoji for the event')
                        .setRequired(true))
                .addStringOption(eventDate =>
                    eventDate
                        .setName('date')
                        .setDescription('The new date for the event')
                        .setRequired(true)))

        // Cancel subcommand
        .addSubcommand(cancelSubcommand =>
            cancelSubcommand
                .setName('cancel')
                .setDescription('Cancel an event :(')
                .addStringOption(eventEmoji =>
                    eventEmoji
                        .setName('emoji')
                        .setDescription('The unique emoji for the event')
                        .setRequired(true))),

    async execute (interaction) {
        // Dependencies
        const Discord = require('discord.js');

        // On /event help, display event command help
        if (interaction.options.getSubcommand() === 'help') {
            const eventHelpEmbed = new Discord.MessageEmbed()
                .setColor('#ff0cff')
                .setTitle('Event command')
                .setDescription('Used to create new events and roles we can track/mention')
                .addField('add', '\`/event add [name of event] [event emoji] [event date] [optional: another potential event date] ...\` *(up to four potential dates)*', false)
                .addField('reschedule', '\`/event reschedule [event emoji] [date]\`', false)
                .addField('cancel', '\`/event cancel [event emoji]\`', false);
            await interaction.reply({ embeds: [eventHelpEmbed] });

        // Execute /event add
        } else if (interaction.options.getSubcommand() === 'add') {

            // Make the server ID accessible by the event schema
            global.guildId = interaction.guildId;

            // Dependencies
            const Discord = require('discord.js');
            require('mongoose');
            const Event = require('../config/event-schema');
            global.fetch = require('node-fetch');
            const unsplash = require('unsplash-js').createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

            // Search for an existing event emoji and return if it exists
            Event.findOne({ eventEmoji: interaction.options.getString('emoji') }).then((eventExists) => {
                if (eventExists) {
                    interaction.reply('This event already exists! Try a different emoji.');
                } else if (!eventExists) {

                    // Fetch thumbnail from Unsplash
                    unsplash.search.getPhotos({
                        query: interaction.options.getString('name'),
                        page: 1,
                        perPage: 10,
                        orderBy: 'relevant'
                    }).then(result => {
                        let thumbnailUrl;
                        let thumbnailFooter;
                        if (result.errors) {
                            interaction.reply('Encountered an error fetching a thumbnail (check bot console)! To avoid confusion, event was not created in database.');
                            console.log(result.errors[0]);
                        } else {
                            const feed = result.response;
                            const { results } = feed;

                            // If image search doesn't return any results, set embed thumbnail to Register logo
                            if (!results[0]) {
                                thumbnailUrl = 'https://raw.githubusercontent.com/edwardshturman/register-bot/master/assets/register-logo-circle.png';
                                thumbnailFooter = '(Couldn\'t find a thumbnail for that place!)'
                            } else if (results[0]) {
                                thumbnailUrl = results[0].urls.regular;
                                thumbnailFooter = 'Image by ' + results[0].user.name + ' on Unsplash';
                            }

                            // Check if there are multiple date options
                            if (!interaction.options.getString('date2')) {

                                // Create newEventEmbed using event name, date, and Unsplash thumbnail with author info
                                const newEventEmbed = new Discord.MessageEmbed()
                                    .setColor('#ff0cff')
                                    .setTitle('New event: ' + interaction.options.getString('name'))
                                    .setDescription('React to this message to be given the associated role!')
                                    .setThumbnail(thumbnailUrl)
                                    .addField('When:', interaction.options.getString('date'), false)
                                    .setFooter(thumbnailFooter);

                                // Send newEventEmbed, get message ID through newEventMsg
                                interaction.reply({ embeds: [newEventEmbed] }).then(async (newEventInteraction) => {
                                    const newEventMsg = await interaction.fetchReply();

                                    // Create a role for the event using the event name and unique emoji
                                    interaction.guild.roles.create({ name: interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                                        .then((newEventRole) => {

                                            // Create an event in MongoDB using the event name, date, unique emoji, newEventEmbed message ID, and the event role ID
                                            new Event({
                                                eventName: interaction.options.getString('name'),
                                                eventDate: interaction.options.getString('date'),
                                                eventEmoji: interaction.options.getString('emoji'),
                                                eventMessageId: newEventMsg.id,
                                                eventRoleId: newEventRole.id
                                            }).save().then((newEvent) => {

                                                // React to the newEventEmbed with the event unique emoji
                                                newEventMsg.react(newEvent.eventEmoji);
                                            });
                                        });
                                });

                            } else if (interaction.options.getString('date2')) {

                                if (interaction.options.getString('date3')) {

                                    if (interaction.options.getString('date4')) {

                                        // Four options for event date exist; create newEventEmbed using event name and Unsplash thumbnail with author info
                                        const newEventEmbed = new Discord.MessageEmbed()
                                            .setColor('#ff0cff')
                                            .setTitle('New event: ' + interaction.options.getString('name'))
                                            .setDescription('React to this message to indicate which day(s) you can go!')
                                            .setThumbnail(thumbnailUrl)
                                            .addField('When:', `:one: ${interaction.options.getString('date')}\n:two: ${interaction.options.getString('date2')}\n:three: ${interaction.options.getString('date3')}\n:four: ${interaction.options.getString('date4')}`, false)
                                            .setFooter(thumbnailFooter);

                                        // Send newEventEmbed, get message ID through newEventMsg
                                        interaction.reply({ embeds: [newEventEmbed] }).then(async (newEventInteraction) => {
                                            const newEventMsg = await interaction.fetchReply();

                                            // Create a role for the event using the event name and unique emoji
                                            interaction.guild.roles.create({ name: interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                                                .then((newEventRole) => {

                                                    // Create an event in MongoDB using the event name, date, unique emoji, newEventEmbed message ID, and the event role ID
                                                    new Event({
                                                        eventName: interaction.options.getString('name'),
                                                        eventDate: 'TBD',
                                                        eventEmoji: interaction.options.getString('emoji'),
                                                        eventMessageId: newEventMsg.id,
                                                        eventRoleId: newEventRole.id
                                                    }).save().then((newEvent) => {

                                                        // React to the newEventEmbed with the event date options
                                                        newEventMsg.react('1️⃣');
                                                        newEventMsg.react('2️⃣');
                                                        newEventMsg.react('3️⃣');
                                                        newEventMsg.react('4️⃣');
                                                    });
                                                });
                                        });


                                    } else if (!interaction.options.getString('date4')) {

                                        // Three options for event date exist; create newEventEmbed using event name and Unsplash thumbnail with author info
                                        const newEventEmbed = new Discord.MessageEmbed()
                                            .setColor('#ff0cff')
                                            .setTitle('New event: ' + interaction.options.getString('name'))
                                            .setDescription('React to this message to indicate which day(s) you can go!')
                                            .setThumbnail(thumbnailUrl)
                                            .addField('When:', `:one: ${interaction.options.getString('date')}\n:two: ${interaction.options.getString('date2')}\n:three: ${interaction.options.getString('date3')}`, false)
                                            .setFooter(thumbnailFooter);

                                        // Send newEventEmbed, get message ID through newEventMsg
                                        interaction.reply({ embeds: [newEventEmbed] }).then(async (newEventInteraction) => {
                                            const newEventMsg = await interaction.fetchReply();

                                            // Create a role for the event using the event name and unique emoji
                                            interaction.guild.roles.create({ name: interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                                                .then((newEventRole) => {

                                                    // Create an event in MongoDB using the event name, date, unique emoji, newEventEmbed message ID, and the event role ID
                                                    new Event({
                                                        eventName: interaction.options.getString('name'),
                                                        eventDate: 'TBD',
                                                        eventEmoji: interaction.options.getString('emoji'),
                                                        eventMessageId: newEventMsg.id,
                                                        eventRoleId: newEventRole.id
                                                    }).save().then((newEvent) => {

                                                        // React to the newEventEmbed with the event date options
                                                        newEventMsg.react('1️⃣');
                                                        newEventMsg.react('2️⃣');
                                                        newEventMsg.react('3️⃣');
                                                    });
                                                });
                                        });

                                    }

                                }

                                else if (!interaction.options.getString('date3')) {

                                    // Two options for event date exist; create newEventEmbed using event name and Unsplash thumbnail with author info
                                    const newEventEmbed = new Discord.MessageEmbed()
                                        .setColor('#ff0cff')
                                        .setTitle('New event: ' + interaction.options.getString('name'))
                                        .setDescription('React to this message to indicate which day(s) you can go!')
                                        .setThumbnail(thumbnailUrl)
                                        .addField('When:', `:one: ${interaction.options.getString('date')}\n:two: ${interaction.options.getString('date2')}`, false)
                                        .setFooter(thumbnailFooter);

                                    // Send newEventEmbed, get message ID through newEventMsg
                                    interaction.reply({ embeds: [newEventEmbed] }).then(async (newEventInteraction) => {
                                        const newEventMsg = await interaction.fetchReply();

                                        // Create a role for the event using the event name and unique emoji
                                        interaction.guild.roles.create({ name: interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                                            .then((newEventRole) => {

                                                // Create an event in MongoDB using the event name, date, unique emoji, newEventEmbed message ID, and the event role ID
                                                new Event({
                                                    eventName: interaction.options.getString('name'),
                                                    eventDate: 'TBD',
                                                    eventEmoji: interaction.options.getString('emoji'),
                                                    eventMessageId: newEventMsg.id,
                                                    eventRoleId: newEventRole.id
                                                }).save().then((newEvent) => {

                                                    // React to the newEventEmbed with the event date options
                                                    newEventMsg.react('1️⃣');
                                                    newEventMsg.react('2️⃣');
                                                });
                                            });
                                    });

                                }

                            }

                        }
                    });
                }
            });

        // Execute /event reschedule
        } else if (interaction.options.getSubcommand() === 'reschedule') {

            // Make the server ID accessible by the event schema
            global.guildId = interaction.guildId;

            // Dependencies
            const Discord = require('discord.js');
            require('mongoose');
            const Event = require('../config/event-schema');

            // Using unique event emoji, find event and pass currentEvent to use for editing original newEventEmbed
            await Event.findOne({ eventEmoji: interaction.options.getString('emoji') }).then(async (currentEvent) => {

                // Check if event exists using unique emoji, ignore if it doesn't
                if (!currentEvent) {
                    await interaction.reply('Couldn\'t find that event! Try a different emoji.');
                } else if (currentEvent) {

                    // Using unique event emoji, find event and change date
                    await Event.updateOne({ eventEmoji: interaction.options.getString('emoji') }, { eventDate: interaction.options.getString('date') }).then(async () => {

                        // Search for newEventEmbed message in channel where /event reschedule command is used
                        await interaction.channel.messages.fetch(currentEvent.eventMessageId).then((currentEventMsg) => {

                            if (!currentEventMsg) {
                                interaction.reply('Couldn\'t find that event! Try searching in the channel where it was created.');
                            } else if (currentEventMsg) {

                                // Edit original newEventEmbed
                                const newEventEmbed = new Discord.MessageEmbed()
                                    .setColor('#ff0cff')
                                    .setTitle('New event: ' + currentEvent.eventName)
                                    .setDescription('React to this message to be given the associated role!')
                                    .setThumbnail(currentEventMsg.embeds[0].thumbnail.url)
                                    .addField('When:', interaction.options.getString('date'), false)
                                    .setFooter(currentEventMsg.embeds[0].footer.text);
                                currentEventMsg.edit({ embeds: [newEventEmbed] });

                                // Unsure if removing reactions on reschedule is ideal
                                // Would make it cleaner if there are >1 date options, but may be counterintuitive for agreed-upon reschedules
                                // currentEventMsg.reactions.removeAll();
                                currentEventMsg.react(interaction.options.getString('emoji'));
                            }
                        });

                        await interaction.reply('Event rescheduled! Check the original message for the new details.');

                    });

            }});

        // Execute /event cancel
        } else if (interaction.options.getSubcommand() === 'cancel') {

            // Make the server ID accessible by the event schema
            global.guildId = interaction.guildId;

            // Dependencies
            const Discord = require('discord.js');
            require('mongoose');
            const Event = require('../config/event-schema');

            // Using unique event emoji, find event and pass currentEvent to use for editing original newEventEmbed
            await Event.findOne({ eventEmoji: interaction.options.getString('emoji') }).then(async (currentEvent) => {

                // Check if event exists using unique emoji, ignore if it doesn't
                if (!currentEvent) {
                    await interaction.reply('Couldn\'t find that event! Try a different emoji.');
                } else if (currentEvent) {

                    // Search for newEventEmbed message in channel where /event cancel command is used
                    await interaction.channel.messages.fetch(currentEvent.eventMessageId).then((currentEventMsg) => {

                        if (!currentEventMsg) {
                            interaction.reply('Couldn\'t find that event! Try searching in the channel where it was created.');
                        } else if (currentEventMsg) {

                            // Edit original newEventEmbed
                            const newEventEmbed = new Discord.MessageEmbed()
                                .setColor('#ff0cff')
                                .setTitle('[Canceled event]')
                                .setDescription('This event was canceled :(')
                                .setThumbnail(currentEventMsg.embeds[0].thumbnail.url)
                                .addField('Where:', currentEvent.eventName, false)
                                .addField('Was scheduled for:', currentEvent.eventDate, false)
                                .setFooter(currentEventMsg.embeds[0].footer.text);
                            currentEventMsg.edit({ embeds: [newEventEmbed] });
                        }
                    });

                    // Delete event role
                    await interaction.guild.roles.cache.get(currentEvent.eventRoleId).delete();

                    // Find event using unique emoji and delete from MongoDB
                    await Event.deleteOne({ eventEmoji: interaction.options.getString('emoji') });
                    await interaction.reply('Event canceled; the original message was edited accordingly :(');

                }
            });
        }
    }
};
