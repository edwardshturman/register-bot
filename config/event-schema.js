const eventCommand = require('../commands/event');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventName: String,
    eventDate: String,
    eventEmoji: String,
    eventMessageId: String,
    eventRoleId: String
}, { collection: eventCommand.guildId });

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
