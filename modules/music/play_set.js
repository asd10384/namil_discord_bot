
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { play_score } = require('./play_score');
const { play_end } = require('./play_end');

module.exports = {
    play_set: async function play_set (client) {
        try {
            await db.set('db.music.user', {});
            await db.set('db.music.score', {});
            await db.set('db.music.skip', 0);
            var list = `**잠시뒤 음악퀴즈가 시작됩니다.**`;
            var channelid = db.get('db.music.channel');
            var listid = db.get('db.music.listid');
            await play_score(client);
            try {
                var c = client.channels.cache.get(channelid);
                c.messages.fetch(listid).then(m => {
                    m.edit(list);
                });
            } catch(err) {}
        } catch(err) {
            return play_end(client);
        }
    },
}
