const { Schema, model } = require('mongoose');

const dataSchema = Schema({
    serverid: String,
    channelid: String,
    voicechannelid: String,
    listid: String,
    npid: String,
    scoreid: String,
    ttsid: String,
    name: Array,
    vocal: Array,
    link: Array,
    count: Number,
    skip: Number,
    start: Boolean,
    sthas: Boolean,
    tts: Boolean,
    role: Array,
    anser_list: Array,
    anser_time: Number,
    anser: Number
});

module.exports = model('music_Data', dataSchema);
