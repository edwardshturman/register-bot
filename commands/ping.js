module.exports = {
    name: 'ping',
    description: 'The ping command.',
    execute (message, args) {
        message.channel.send('Pong!');
    }
};
