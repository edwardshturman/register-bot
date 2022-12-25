import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    guildId: String,
    eventName: String,
    eventDate: String,
    eventEmoji: String,
    eventMessageId: String,
    eventRoleId: String
});

const Event = mongoose.model('event', eventSchema);

export default Event;
