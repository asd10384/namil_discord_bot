
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { play_end } = require('./play_end');

module.exports = {
    play_score: async function play_score (client) {
        var channelid = await db.get('db.music.channel');
        var scoreid = await db.get('db.music.scoreid');
        var score = await db.get('db.music.score');
        var skip = await db.get('db.music.skip');
        var text = '';
        var i = 1;
        for (s in score) {
            text += `**${i}.** <@${s}> : ${score[s]}\n`;
            i++;
        }
        if (text == undefined || text == '') {
            text = `**1. **없음\n`;
        }
        if (skip == undefined) {
            skip = 0;
        }
        text += `\n스킵한 노래 : ${skip}곡`;
        var emscore = new MessageEmbed()
            .setTitle(`**[ 음악퀴즈 스코어 ]**`)
            .setDescription(text)
            .setFooter(`스코어는 다음게임 전까지 사라지지 않습니다.`)
            .setColor('ORANGE');
        try {
            var c = client.channels.cache.get(channelid);
            c.messages.fetch(scoreid).then(m => {
                m.edit(emscore);
            });   
        } catch(err) {
            return await play_end(client);
        }
    },
}
