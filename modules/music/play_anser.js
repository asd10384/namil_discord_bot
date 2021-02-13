
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { play } = require('./play');
const { play_score } = require('./play_score');

module.exports = {
    play_anser: async function play_anser (message, client, args) {
        try {
            await db.set('db.music.user', {});
            if (!(args[0] == '스킵' || args[0] == 'skip')) {
                var userid = await message.member.user.username;
                var score = await db.get('db.music.score');
                if (score[userid]) {
                    score[userid] = score[userid] + 1;
                } else {
                    score[userid] = 1;
                }
                await db.set('db.music.score', score);
            } else {
                var skip = await db.get('db.music.skip');
                if (skip == undefined || skip == 0) {
                    skip = 1;
                } else {
                    skip = skip + 1;
                }
                await db.set('db.music.skip', skip);
            }
            var count = await db.get('db.music.count');
            var name = await db.get('db.music.name')[count];
            var vocal = await db.get('db.music.vocal')[count];
            var link = await db.get('db.music.link')[count];
            var list = `음악퀴즈를 종료하시려면 \` ;음악퀴즈 종료 \`를 입력해 주세요.`;
            var np = new MessageEmbed()
                .setTitle(`**정답 : ${name}**`)
                .setDescription(`**[가수 : ${vocal}](${link})**\n정답자 : ${message.author.username}`)
                .setImage(`https://i.ytimg.com/vi_webp/${link.replace('https://youtu.be/', '')}/maxresdefault.webp`)
                .setFooter(`10초뒤에 다음곡으로 넘어갑니다.`)
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
        await db.set('db.music.count', db.get('db.music.count')+1);
        setTimeout(async function() {
            var c = client.channels.cache.get(await db.get('db.music.voicechannel'));
            await play(client, c, message);
        }, 10000);
    },
}
