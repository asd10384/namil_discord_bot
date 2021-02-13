
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { play_score } = require('./play_score');

module.exports = {
    play_set: async function play_set (client) {
        try {
            await db.set('db.music.user', {});
            await db.set('db.music.score', {});
            await db.set('db.music.skip', 0);
            var list = `음악퀴즈 준비중입니다.`;
            var np = new MessageEmbed()
                .setTitle(`**잠시뒤 음악퀴즈가 시작됩니다.**`)
                .setDescription(`[유튜브 링크](http://youtube.com)`)
                .setImage(`https://cdn.hydra.bot/hydra_no_music.png`)
                .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                .setColor('ORANGE');
            var channelid = db.get('db.music.channel');
            var listid = db.get('db.music.listid');
            var npid = db.get('db.music.npid');
            var c = client.channels.cache.get(channelid);
            await play_score(client);
            c.messages.fetch(listid).then(m => {
                m.edit(list);
            });
            c.messages.fetch(npid).then(m => {
                m.edit(np);
            });
        } catch(err) {
            return ;
        }
    },
}
