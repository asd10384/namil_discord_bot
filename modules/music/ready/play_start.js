
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, mongourl } = require('../../../config.json');

const { msg_start } = require('./msg_start');

const { dbset, dbset_music } = require('../../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../../music_data');

module.exports = {
    play_start: async function play_start (client, message, args, voiceChannel) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));

            const serverid = message.guild.id;
            await db.set(`db.music.${serverid}.page`, 1);
            await db.set(`db.music.${serverid}.lrpage`, 1);
            await msg_start(client, serverid, message, args, 0, voiceChannel, data.channelid, data.npid, true);
        });
    },
}
