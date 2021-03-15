
const db = require('quick.db');
const { default_prefix, mongourl } = require('../../../config.json');

const { play_score } = require('./play_score');
const { play_end } = require('../play_end');

const { dbset, dbset_music } = require('../../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../../music_data');

module.exports = {
    play_set: async function play_set (client, message) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));

            try {
                await db.set(`db.music.${message.guild.id}.user`, []);
                await db.set(`db.music.${message.guild.id}.hint`, []);
                await db.set(`db.music.${message.guild.id}.hintget`, false);
                await db.set(`db.music.${message.guild.id}.score`, {});
                data.skip = 0;
                await data.save().catch(err => console.log(err));
                var list = `**잠시뒤 음악퀴즈가 시작됩니다.**`;
                var channelid = data.channelid;
                var listid = data.listid;
                await play_score(client, message);
                try {
                    var c = client.channels.cache.get(channelid);
                    c.messages.fetch(listid).then(m => {
                        m.edit(list);
                    });
                } catch(err) {}
            } catch(err) {
                return play_end(client, message);
            }
        });
    },
}
