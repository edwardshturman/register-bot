module.exports = {
    name: 'suggest',
    description: 'Suggestion command',
    execute (message, args) {
        const Discord = require('discord.js');
        const channel = message.guild.channels.cache.get('825248648299937832'); // #announcements
        if (!channel) return message.channel.send('Suggestions channel does not exist!');
        if (!args[0]) return message.delete();

        const messageArgs = args.join(' ');
        if (args[0]) {
            const embed = new Discord.MessageEmbed()
                .setColor('#ff3300')
                .setAuthor(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
                .setTitle('New suggestion:')
                .setDescription(messageArgs);

            channel.send(embed)
                .then((msg) => {
                    msg.react('👍');
                    msg.react('👎');
                    message.delete();
                }).catch((err) => {
                    throw err;
                });
        }
    }
};
