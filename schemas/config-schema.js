import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const configSchema = new Schema({
    guildId: String,
    options: Object
}, { collection: 'configs' });

const Config = mongoose.model('config', configSchema);

export default Config;
