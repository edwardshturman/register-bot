const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    tripName: String,
    tripDate: String,
    tripEmoji: String,
    tripMessageId: String,
    tripRoleId: String
});

const Trip = mongoose.model('trip', tripSchema);

module.exports = Trip;
