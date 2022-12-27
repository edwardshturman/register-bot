import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import Config from '../schemas/config-schema.js';

const configCommand = {
    data: new SlashCommandBuilder()

        // Config command
        .setName('config')
        .setDescription('Update the server\'s configuration options')
        .addSubcommand(helpSubcommand => helpSubcommand
            .setName('help')
            .setDescription('Display config command help'))

        // Config set subcommand
        .addSubcommand(setSubcommand => setSubcommand
            .setName('set')
            .setDescription('Set an option within the server\'s config')
            .addStringOption(key => key
                .setName('key')
                .setDescription('The option')
                .setChoices(
                    { name: 'allowPurging', value: 'allowPurging' })
                .setRequired(true))
            .addStringOption(value => value
                .setName('value')
                .setDescription('What to set the option to')
                .setRequired(true))),

    async execute (interaction) {
        // On /config help, display config command help
        if (interaction.options.getSubcommand() === 'help') {
            const configHelpEmbed = new Discord.MessageEmbed()
                .setColor('#42a3ef')
                .setTitle('Config command')
                .setDescription('Update the server\'s configuration options')
                .setFields({
                    name: 'set',
                    value: 'Set an option within the server\'s config\n' +
                            '`/config set [key] [value]`\n' +
                            'Valid keys and values: `allowPurging` (`true` or `false`)\n',
                    inline: false
                });
            await interaction.reply({ embeds: [configHelpEmbed], ephemeral: true });

        // Execute /config set
        } else if (interaction.options.getSubcommand() === 'set') {
            // Validate the key and value
            if (interaction.options.getString('key') === 'allowPurging')
                if (interaction.options.getString('value') !== 'true' && interaction.options.getString('value') !== 'false')
                    return await interaction.reply({ content: 'Invalid value for `allowPurging`! Valid values are `true` and `false`.', ephemeral: true });

            let configFound = false;
            let existingOptions = {};

            // Search for the server's config, create a blank one if it doesn't exist
            await Config.findOne({ guildId: interaction.guild.id }).then(async (config) => {
                if (config) {
                    configFound = true;
                    existingOptions = config.options;
                } else {
                    await new Config({
                        guildId: interaction.guild.id,
                        options: {
                            [interaction.options.getString('key')]: interaction.options.getString('value')
                        }
                    }).save();
                    await interaction.reply({ content: 'Created a new config for the server, and set ' + interaction.options.getString('key') + ' to ' + interaction.options.getString('value') + '.', ephemeral: true });
                }
            });

            // Server config exists, update based on options
            if (configFound) {
                await Config.updateOne({ guildId: interaction.guildId }, {
                    options: {
                        ...existingOptions,
                        [interaction.options.getString('key')]: interaction.options.getString('value')
                    }
                });

                // Create configUpdatedEmbed to confirm update
                const configUpdatedEmbed = new Discord.MessageEmbed()
                    .setColor('#42a3ef')
                    .setTitle('Config updated:')
                    .setFields({
                        name: '`' + interaction.options.getString('key') + '`',
                        value: '`' + interaction.options.getString('value') + '`',
                        inline: false
                    },
                    {
                        name: 'Set by:',
                        value: '<@' + interaction.member.id + '>',
                        inline: false
                    });

                // Send configUpdatedEmbed
                interaction.reply({ embeds: [configUpdatedEmbed], ephemeral: true });
            }
        }
    }
};

export default configCommand;
