
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
        var list = `__**[ 규칙 ]**__
**1.** 명령어는 \` ${pp}음악퀴즈 명령어 \` 로 확인하실수 있습니다.
**2.** 정답은 채팅창에 그냥 입력하시면 됩니다.
**3.** 정답은 가수-제목 순서로 쓰시면 됩니다. (중간에 - 도 입력해주세요.)
(제목 및 가수는 오피셜(멜론) 명칭을 사용했습니다.)
(가수는 무조건 한글로 적어주세요.)
(띄어쓰기나 특수문자 ' 를 유의하여 적어주세요.)
**4.** 오류나 수정사항은 hky4258@naver.com 으로 보내주세요.

음성 채널에 참여한 후 \` 시작 \`을 입력해 음악퀴즈를 시작하세요.`;
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
            try {
                var c = client.channels.cache.get(channelid);
                c.messages.fetch(listid).then(m => {
                    m.edit(list);
                });
                c.messages.fetch(npid).then(m => {
                    m.edit(np);
                });
            } catch(err) {}
        } catch(err) {}
    },
}
