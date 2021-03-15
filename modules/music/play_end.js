
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, mongourl } = require('../../config.json');

const { dbset, dbset_music } = require('../functions');
const { msg_list, msg_np } = require('./play_msg');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../music_data');

module.exports = {
    play_end: async function play_end (client, message) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            data.name = [];
            data.vocal = [];
            data.link = [];
            data.count = 0;
            data.start = false;
            data.tts = true;
            data.skip = 0;
            await db.set(`db.music.${message.guild.id}.user`, []);
            await db.set(`db.music.${message.guild.id}.hint`, []);
            await db.set(`db.music.${message.guild.id}.hintget`, false);
            await db.set(`db.music.${message.guild.id}.skipget`, false);
            await db.set(`db.music.${message.guild.id}.score`, {});
            await data.save().catch(err => console.log(err));
            var anser = data.anser_list[data.anser];
            var time = data.anser_time;
            var list = await msg_list();
            var np = await msg_np(anser, time);
            try {
                try {
                    message.guild.channels.cache.get(data.voicechannelid).leave();
                } catch(err) {}
                try {
                    client.channels.cache.get(data.voicechannelid).leave();
                } catch(err) {}
                try {
                    var c = client.channels.cache.get(data.channelid);
                    c.messages.fetch(data.listid).then(m => {
                        m.edit(list);
                    });
                    c.messages.fetch(data.npid).then(m => {
                        m.edit(np);
                        m.reactions.removeAll();
                    });
                    
                } catch(err) {}
            } catch(err) {}
        });
    },
}
