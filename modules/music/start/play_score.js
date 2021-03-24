
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, mongourl } = require('../../../config.json');

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
    play_score: async function play_score (client, message) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            var score = await db.get(`db.music.${message.guild.id}.score`);
            var skip = data.skip;
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
                var c = client.channels.cache.get(data.channelid);
                c.messages.fetch(data.scoreid).then(m => {
                    m.edit(emscore);
                });   
            } catch(err) {
                return await play_end(client, message);
            }
        });
    },
}
