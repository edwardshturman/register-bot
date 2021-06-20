module.exports = {
    name: 'help',
    description: 'Displays available commands.',
    execute (message, args) {
        const Discord = require('discord.js');
        const helpEmbedOne = new Discord.MessageEmbed()
            .setColor('#ff3300')
            // .setTitle('d.srupt help')
            .setTitle('d.tech Discord bots')
            // .setURL('https://community.dcraft.net/bots')
            .setThumbnail('https://dcraft.net/wp-content/uploads/2020/09/d.srupt-v3.png')
            .addField('Hey there!', 'As you may have noticed, we\'ve got a lot of bots here, all with their own commands and help pages:', false)
            // .addField('d.ping', 'does what you think it does', false)
            // .addField('d.yt', 'sends a link to the glorious d.craft YouTube', false)
            // .addField('d.verify', 'super high level tactic, remember it, yeah?', false) // testing, use role check from command and remove in production
            // .addField('d.play // d.skip // d.stop // d.np // d.q // d.pause // d.resume', 'low-level "music commands"', false)
            // .addField('d.ranks', 'displays d.craft ranks', false) // maybe mod-only
            // .addField('d.clubs', 'displays list of d.tech gaming clubs d.games supports', false) // mod-only, remove in production
            // .addField('d.list', 'displays list of d.games servers', false) // mod-only, remove in production
            // .addField('d.help', 'listed here to make bot look more feature-filled', false);

        message.channel.send(helpEmbedOne);

        const helpEmbedTwo = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setThumbnail('https://dcraft.net/wp-content/uploads/2020/09/d-scord-draft-copy.png')
            .addField('d.scord', 'd.verify on steroids. jk, it\'s just the d.verify bot. Helps keep things safe', false)
        message.channel.send(helpEmbedTwo);

        const helpEmbedThree = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setThumbnail('https://dcraft.net/wp-content/uploads/2020/12/d.j-logo.png')
            .addField('d.j', 'Low-level "music" bot', false);
        message.channel.send(helpEmbedThree);

        const helpEmbedFour = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setThumbnail('https://dcraft.net/wp-content/uploads/2020/12/server-icon-darker.png')
            .addField('d.bot', 'd.craft\'s server-to-server bot, which syncs your roles here to ranks there', false);
        message.channel.send(helpEmbedFour);

        const helpEmbedFive = new Discord.MessageEmbed()
            .setColor('#ff3300')
            .setThumbnail('https://dcraft.net/wp-content/uploads/2020/09/d.srupt-v3.png')
            .addField('d.srupt', 'The "general" bot for the server, helps keep things clean', false)
            .setFooter('If you\'re looking for any of these, enter the bot name, followed by a "?".\nExample: d.j?');
        message.channel.send(helpEmbedFive);
    }
};
