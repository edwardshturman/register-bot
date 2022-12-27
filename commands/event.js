import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import Event from '../schemas/event-schema.js';
import Config from '../schemas/config-schema.js';
import fetch from 'node-fetch';
import unsplash from 'unsplash-js';

const eventCommand = {
    data: new SlashCommandBuilder()

        // Base event command
        .setName('event')
        .setDescription('Tool for planning and managing events')
        .addSubcommand(helpSubcommand => helpSubcommand
            .setName('help')
            .setDescription('Display event planning help'))

        // Add subcommand
        .addSubcommand(addSubcommand => addSubcommand
            .setName('add')
            .setDescription('Create a new event')
            .addStringOption(eventName => eventName
                .setName('name')
                .setDescription('The name of the event; best if named by location')
                .setRequired(true))
            .addStringOption(eventEmoji => eventEmoji
                .setName('emoji')
                .setDescription('A unique emoji for the event')
                .setRequired(true))
            .addStringOption(eventDate => eventDate
                .setName('date')
                .setDescription('The date of the event; can be specific or arbitrary')
                .setRequired(true))
            .addStringOption(eventDate2 => eventDate2
                .setName('date2')
                .setDescription('Another potential date for the event')
                .setRequired(false))
            .addStringOption(eventDate3 => eventDate3
                .setName('date3')
                .setDescription('Another potential date for the event')
                .setRequired(false))
            .addStringOption(eventDate4 => eventDate4
                .setName('date4')
                .setDescription('Another potential date for the event')
                .setRequired(false)))

        // Rename subcommand
        .addSubcommand(renameSubcommand => renameSubcommand
            .setName('rename')
            .setDescription('Rename an event')
            .addStringOption(eventEmoji => eventEmoji
                .setName('emoji')
                .setDescription('The unique emoji for the event')
                .setRequired(true))
            .addStringOption(eventName => eventName
                .setName('name')
                .setDescription('The new name for the event')
                .setRequired(true)))

        // Reschedule subcommand
        .addSubcommand(rescheduleSubcommand => rescheduleSubcommand
            .setName('reschedule')
            .setDescription('Reschedule an event')
            .addStringOption(eventEmoji => eventEmoji
                .setName('emoji')
                .setDescription('The unique emoji for the event')
                .setRequired(true))
            .addStringOption(eventDate => eventDate
                .setName('date')
                .setDescription('The new date for the event')
                .setRequired(true)))

        // Cancel subcommand
        .addSubcommand(cancelSubcommand => cancelSubcommand
            .setName('cancel')
            .setDescription('Cancel an event :(')
            .addStringOption(eventEmoji => eventEmoji
                .setName('emoji')
                .setDescription('The unique emoji for the event')
                .setRequired(true)))

        // Purge subcommand
        .addSubcommand(purgeSubcommand => purgeSubcommand
            .setName('purge')
            .setDescription('Purge this server\'s events')
            .addStringOption(age => age
                .setName('age')
                .setDescription('How old an event must be to be purged')
                .setChoices(
                    { name: 'Purge all events older than 1 week', value: '1 week' },
                    { name: 'Purge all events older than 1 month', value: '1 month' },
                    { name: 'Purge all events older than 3 months', value: '3 months' },
                    { name: 'Purge all events older than 6 months', value: '6 months' },
                    { name: 'Purge all events older than 1 year', value: '1 year' })
                .setRequired(true))),

    async execute (interaction) {
        // On /event help, display event command help
        if (interaction.options.getSubcommand() === 'help') {
            const eventHelpEmbed = new Discord.MessageEmbed()
                .setColor('#42a3ef')
                .setTitle('Event command')
                .setDescription('Used to create new events and roles we can track/mention')
                .addField('add', '`/event add [name of event] [event emoji] [event date] [optional: another potential event date] ...` *(up to four potential dates)*', false)
                .addField('reschedule', '`/event reschedule [event emoji] [date]`', false)
                .addField('cancel', '`/event cancel [event emoji]`', false);
            await interaction.reply({ embeds: [eventHelpEmbed], ephemeral: true });
        }

        // Execute /event add
        else if (interaction.options.getSubcommand() === 'add') {
            const unsplashConnection = unsplash.createApi({
                accessKey: process.env.UNSPLASH_ACCESS_KEY,
                fetch: fetch
            });

            // Search for an existing event emoji and return if it exists
            Event.findOne({
                guildId: interaction.guildId,
                eventEmoji: interaction.options.getString('emoji')
            }).then((eventExists) => {
                if (eventExists)
                    interaction.reply({ content: 'This event already exists! Try a different emoji.', ephemeral: true });

                else if (!eventExists) {
                    // Fetch thumbnail from Unsplash
                    unsplashConnection.search.getPhotos({
                        query: interaction.options.getString('name'),
                        page: 1,
                        perPage: 10,
                        orderBy: 'relevant'
                    }).then(result => {
                        let thumbnailUrl;
                        let thumbnailFooter;
                        if (result.errors) {
                            interaction.reply({ content: 'Encountered an error fetching a thumbnail (check bot console)! To avoid confusion, event was not created in database.', ephemeral: true });
                            console.log(result.errors[0]);
                        } else {
                            const feed = result.response;
                            const { results } = feed;

                            // If image search doesn't return any results, set embed thumbnail to Register logo
                            if (!results[0]) {
                                thumbnailUrl = 'https://raw.githubusercontent.com/edwardshturman/register-bot/master/assets/register-logo-circle.png';
                                thumbnailFooter = '(Couldn\'t find a thumbnail for that place!)';
                            } else if (results[0]) {
                                thumbnailUrl = results[0].urls.regular;
                                thumbnailFooter = 'Image by ' + results[0].user.name + ' on Unsplash';
                            }

                            // For each date, add to the dates array to be used as a new field in the embed
                            const dates = [];
                            let multiple = false;
                            dates.push(interaction.options.getString('date'));
                            if (interaction.options.getString('date2')) {
                                multiple = true;
                                dates.push(interaction.options.getString('date2'));
                            }
                            if (interaction.options.getString('date3')) {
                                multiple = true;
                                dates.push(interaction.options.getString('date3'));
                            }
                            if (interaction.options.getString('date4')) {
                                multiple = true;
                                dates.push(interaction.options.getString('date4'));
                            }

                            // Only one date specified
                            if (!multiple) {
                                // Create newEventEmbed using event name, date, and Unsplash thumbnail with author info
                                const newEventEmbed = new Discord.MessageEmbed()
                                    .setColor('#42a3ef')
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
                                                guildId: interaction.guildId,
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
                            }

                            else if (multiple) {
                                // Multiple options for event date exist; create newEventEmbed using event name and Unsplash thumbnail with author info
                                const newEventEmbed = new Discord.MessageEmbed()
                                    .setColor('#42a3ef')
                                    .setTitle('New event: ' + interaction.options.getString('name'))
                                    .setDescription('React to this message to indicate which day(s) you can go!')
                                    .setThumbnail(thumbnailUrl)
                                    .setFooter(thumbnailFooter);

                                let counter = 0;
                                dates.forEach(date => {
                                    counter++;
                                    newEventEmbed.addField('Potential date ' + counter + ':', date, true);
                                });

                                // Send newEventEmbed, get message ID through newEventMsg
                                interaction.reply({ embeds: [newEventEmbed] }).then(async (newEventInteraction) => {
                                    const newEventMsg = await interaction.fetchReply();

                                    // Create a role for the event using the event name and unique emoji
                                    interaction.guild.roles.create({ name: interaction.options.getString('name') + ' ' + interaction.options.getString('emoji') })
                                        .then((newEventRole) => {
                                            // Create an event in MongoDB using the event name, date, unique emoji, newEventEmbed message ID, and the event role ID
                                            new Event({
                                                guildId: interaction.guildId,
                                                eventName: interaction.options.getString('name'),
                                                eventDate: 'TBD',
                                                eventEmoji: interaction.options.getString('emoji'),
                                                eventMessageId: newEventMsg.id,
                                                eventRoleId: newEventRole.id
                                            }).save().then((newEvent) => {
                                                // React to the newEventEmbed with the event date options
                                                newEventMsg.react('1️⃣');
                                                newEventMsg.react('2️⃣');
                                                if (counter >= 3) newEventMsg.react('3️⃣');
                                                if (counter === 4) newEventMsg.react('4️⃣');
                                            });
                                        });
                                });
                            }
                        }
                    });
                }
            });
        }

        // Execute /event rename
        else if (interaction.options.getSubcommand() === 'rename') {
            // Using unique event emoji, find event and pass currentEvent to use for editing original newEventEmbed
            await Event.findOne({ guildId: interaction.guildId, eventEmoji: interaction.options.getString('emoji') }).then(async (currentEvent) => {
                // Check if event exists using unique emoji, ignore if it doesn't
                if (!currentEvent)
                    await interaction.reply({ content: 'Couldn\'t find that event! Try a different emoji.', ephemeral: true });

                else if (currentEvent) {
                    // Using unique event emoji, find event and change name
                    await Event.updateOne({ guildId: interaction.guildId, eventEmoji: interaction.options.getString('emoji') }, { eventName: interaction.options.getString('name') }).then(async () => {
                        // Search for newEventEmbed message in channel where /event rename command is used
                        await interaction.channel.messages.fetch(currentEvent.eventMessageId).then((currentEventMsg) => {
                            if (!currentEventMsg)
                                interaction.reply({ content: 'Couldn\'t find that event! Try searching in the channel where it was created.', ephemeral: true });

                            else if (currentEventMsg) {
                                // Edit original newEventEmbed
                                const newEventEmbed = new Discord.MessageEmbed()
                                    .setColor('#42a3ef')
                                    .setTitle('New event: ' + interaction.options.getString('name'))
                                    .setDescription('React to this message to be given the associated role!')
                                    .setThumbnail(currentEventMsg.embeds[0].thumbnail.url)
                                    .addField('When:', currentEvent.eventDate, false)
                                    .setFooter(currentEventMsg.embeds[0].footer.text);
                                currentEventMsg.edit({ embeds: [newEventEmbed] });
                            }
                        });

                        // Edit role name
                        interaction.guild.roles.fetch(currentEvent.eventRoleId).then(eventRole => {
                            eventRole.edit({ name: interaction.options.getString('name') + ' ' + currentEvent.eventEmoji });
                        });
                        await interaction.reply({ content: 'Event renamed! Check the original message for the new details.', ephemeral: true });
                    });
                }
            });
        }

        // Execute /event reschedule
        else if (interaction.options.getSubcommand() === 'reschedule') {
            // Using unique event emoji, find event and pass currentEvent to use for editing original newEventEmbed
            await Event.findOne({ guildId: interaction.guildId, eventEmoji: interaction.options.getString('emoji') }).then(async (currentEvent) => {
                // Check if event exists using unique emoji, ignore if it doesn't
                if (!currentEvent)
                    await interaction.reply({ content: 'Couldn\'t find that event! Try a different emoji.', ephemeral: true });

                else if (currentEvent) {
                    // Using unique event emoji, find event and change date
                    await Event.updateOne({ guildId: interaction.guildId, eventEmoji: interaction.options.getString('emoji') }, { eventDate: interaction.options.getString('date') }).then(async () => {
                        // Search for newEventEmbed message in channel where /event reschedule command is used
                        await interaction.channel.messages.fetch(currentEvent.eventMessageId).then((currentEventMsg) => {
                            if (!currentEventMsg)
                                interaction.reply({ content: 'Couldn\'t find that event! Try searching in the channel where it was created.', ephemeral: true });

                            else if (currentEventMsg) {
                                // Edit original newEventEmbed
                                const newEventEmbed = new Discord.MessageEmbed()
                                    .setColor('#42a3ef')
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

                        await interaction.reply({ content: 'Event rescheduled! Check the original message for the new details.', ephemeral: true });
                        await interaction.channel.send('<@&' + currentEvent.eventRoleId + '>, the event was rescheduled — check the original embed to make sure you can still make it!');
                    });
                }
            });
        }

        // Execute /event cancel
        else if (interaction.options.getSubcommand() === 'cancel') {
            // Using unique event emoji, find event and pass currentEvent to use for editing original newEventEmbed
            await Event.findOne({ guildId: interaction.guildId, eventEmoji: interaction.options.getString('emoji') }).then(async (currentEvent) => {
                // Check if event exists using unique emoji, ignore if it doesn't
                if (!currentEvent)
                    await interaction.reply({ content: 'Couldn\'t find that event! Try a different emoji.', ephemeral: true });

                else if (currentEvent) {
                    // Search for newEventEmbed message in channel where /event cancel command is used
                    await interaction.channel.messages.fetch(currentEvent.eventMessageId).then((currentEventMsg) => {
                        if (!currentEventMsg)
                            interaction.reply({ content: 'Couldn\'t find that event! Try searching in the channel where it was created.', ephemeral: true });

                        else if (currentEventMsg) {
                            // Edit original newEventEmbed
                            const newEventEmbed = new Discord.MessageEmbed()
                                .setColor('#42a3ef')
                                .setTitle('[Canceled event]')
                                .setDescription('This event was canceled :(')
                                .setThumbnail(currentEventMsg.embeds[0].thumbnail.url)
                                .addField('Where:', currentEvent.eventName, false)
                                .addField('Was scheduled for:', currentEvent.eventDate, false)
                                .setFooter(currentEventMsg.embeds[0].footer.text);
                            currentEventMsg.edit({ embeds: [newEventEmbed] });
                        }
                    });

                    // Find event using unique emoji and delete from MongoDB
                    await Event.deleteOne({ guildId: interaction.guildId, eventEmoji: interaction.options.getString('emoji') });
                    await interaction.reply('**' + currentEvent.eventName + '** (<@&' + currentEvent.eventRoleId + '>) was canceled and the associated role deleted.');

                    // Delete event role
                    await interaction.guild.roles.cache.get(currentEvent.eventRoleId).delete();
                }
            });
        }

        // Execute /event purge
        else if (interaction.options.getSubcommand() === 'purge') {
            // Check server's config for if purging is allowed
            const config = await Config.findOne({ guild: interaction.guildId });
            if (!config)
                return await interaction.reply({ content: 'This server hasn\'t set up a config yet! Ask an admin to run `/config set`.', ephemeral: true });

            else if (config)
                if (config.options.allowPurging !== 'true')
                    return await interaction.reply({ content: 'This server doesn\'t allow purging events!', ephemeral: true });

            const eventsCreatedByRegister = [];
            const eventsToDelete = [];

            // Determine age of events to delete
            const eventAge = interaction.options.getString('age');
            let eventAgeMs = 0;
            if (eventAge === '1 week')
                eventAgeMs = 604800000;
            else if (eventAge === '1 month')
                eventAgeMs = 2629746000;
            else if (eventAge === '3 months')
                eventAgeMs = 7889238000;
            else if (eventAge === '6 months')
                eventAgeMs = 15778476000;
            else if (eventAge === '1 year')
                eventAgeMs = 31556952000;

            // Fetch all of the server's events and add to eventsCreatedByRegister
            await Event.find({ guild: interaction.guildId }).then(async (events) => {
                events.forEach((event) => {
                    eventsCreatedByRegister.push(event.eventRoleId);
                });
            });

            // Determine which events to delete based on when the role was created
            await interaction.guild.roles.cache.forEach((role) => {
                if (eventsCreatedByRegister.includes(role.id) && role.createdAt.getTime() < Date.now() - eventAgeMs)
                    eventsToDelete.push(role.id);
            });

            // Delete event roles
            for (let i = 0; i < eventsToDelete.length; i++)
                await interaction.guild.roles.cache.get(eventsToDelete[i]).delete();

            // Delete events from MongoDB
            await Event.deleteMany({ guildId: interaction.guildId, eventRoleId: { $in: eventsToDelete } });
            await interaction.reply('All events older than **' + eventAge + '** were deleted.');
        }
    }
};

export default eventCommand;
