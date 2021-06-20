module.exports = {
    name: 'scribe',
    description: 'Server updates command',
    execute (message, args) {
        const Discord = require('discord.js');
        if (args[0] === '2020.12.18') {
            message.channel.send('<:dlineleft:777449590718070795><:dlinecenter:777449590974185474><:dlineright:777449591179182110> <:dscord:777453385443573771> ***Server updates — December 18, 2020*** <:dscord:777453385443573771> <:dlineleft:777449590718070795><:dlinecenter:777449590974185474><:dlineright:777449591179182110>');
            const dec182020ClubsEmbed = new Discord.MessageEmbed()
                .setColor('#ff3300')
                .setTitle('NEW: Clubs channel')
                .setDescription('It\'s a small list at the moment, but we now have a place for d.games-supported clubs! Check em out and sign up :)')
                .setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/house-with-garden_1f3e1.png');
            const dec182020InterestsEmbed = new Discord.MessageEmbed()
                .setColor('#ff3300')
                .setTitle('NEW: Interests channel')
                .setDescription('Into something but don\'t have time to commit to a club, or want a quicker way of meeting people who are into the same thing? Check out #interests!')
                .setThumbnail('https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/busts-in-silhouette_1f465.png');
            message.channel.send(dec182020ClubsEmbed)
                .then(message.channel.send(dec182020InterestsEmbed));
        }
    }
};
