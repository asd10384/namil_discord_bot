
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

module.exports = {
    play_end: async function play_end (client) {
        await db.set('db.music.user', {});
        await db.set('db.music.name', []);
        await db.set('db.music.vocal', []);
        await db.set('db.music.link', 0);
        await db.set('db.music.count', 0);
        await db.set('db.music.start', 'x');
        await db.set('db.music.tts', true);
        await db.set('db.music.score', {});
        await db.set('db.music.skip', 0);
        var list = `음성 채널에 참여한 후 \` 시작 \`을 입력해 음악퀴즈를 시작하세요.`;
        var np = new MessageEmbed()
            .setTitle(`**현재 음악퀴즈가 시작되지 않았습니다.**`)
            .setDescription(`[유튜브 링크](http://youtube.com)`)
            .setImage(`https://cdn.hydra.bot/hydra_no_music.png`)
            .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
            .setColor('ORANGE');
        try {
            try {
                client.channels.cache.get(await db.get('db.music.voicechannel')).leave();
            } catch(err) {}
            var channelid = db.get('db.music.channel');
            var listid = db.get('db.music.listid');
            var npid = db.get('db.music.npid');
            var c = client.channels.cache.get(channelid);
            c.messages.fetch(listid).then(m => {
                m.edit(list);
            });
            c.messages.fetch(npid).then(m => {
                m.edit(np);
            });
            return ;
        } catch(err) {
            return ;
        }
    },
}
