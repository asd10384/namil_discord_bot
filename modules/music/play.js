
const ytdl = require('ytdl-core');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

module.exports = {
    play: async function play (client, channel, message) {
        await db.set('db.music.user', {});
        await db.set('db.music.tts', false);
        await db.set('db.music.start', 'o');
        var count = db.get('db.music.count');
        var link = db.get('db.music.link')[count];
        if (link == undefined || link == null) {
            channel.leave();
            return this.play_end(client);
        }
        var url = ytdl(link, { bitrate: 512000 });
        var options = {
            volume: 0.08
        };
        
        try {
            var list = `음악퀴즈를 종료하시려면 \` ;음악퀴즈 종료 \`를 입력해주세요.\n음악을 스킵하시려면 \` 스킵 \`을 입력해 주세요.`;
            var np = new MessageEmbed()
                .setTitle(`**정답 : ???**`)
                .setDescription(`채팅창에 가수-제목 순서로 적어주세요.`)
                .setImage(`https://ytms.netlify.app/question_mark.png`)
                .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                .setColor('ORANGE');
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
        } catch(err) {}

        const broadcast = client.voice.createBroadcast();
        channel.join().then(connection => {
            broadcast.play(url, options);
            connection.play(broadcast);
        });
    },
}
