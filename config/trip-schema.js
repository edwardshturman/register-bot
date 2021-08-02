const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    tripName: String,
    tripId: String,
    tripDate: String
});

const Trip = mongoose.model('trip', tripSchema);

module.exports = Trip;
