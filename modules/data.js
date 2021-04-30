const { Schema, model } = require('mongoose');

const dataSchema = Schema({
    name: String,
    userID: String,
    lb: String,
    money: Number,
    daily: String,
    stock: Array,
    tts: Boolean,
    selfcheck: {
        area: String,
        school: String,
        name: String,
        birthday: String,
        password: String,
    },
});

module.exports = model('Data', dataSchema);
