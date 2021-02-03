const { Schema, model } = require('mongoose');

const dataSchema = Schema({
    name: String,
    userID: String,
    lb: String,
    money: Number,
    daily: String,
    stock: Array
});

module.exports = model('Data', dataSchema);
