
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { play } = require('./play');
const { play_score } = require('./play_score');
const { play_end } = require('./play_end');

const { mongourl } = require('../../config.json');
const { dbset, dbset_music } = require('../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../music_data');

module.exports = {
    play_anser: async function play_anser (message, client, args) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            try {
                await data.save().catch(err => console.log(err));
                if (!(args[0] == '스킵' || args[0] == 'skip')) {
                    var userid = await message.author.id;
                    var score = await db.get(`db.music.${message.guild.id}.score`);
                    if (score[userid]) {
                        score[userid] = score[userid] + 1;
                    } else {
                        score[userid] = 1;
                    }
                    await db.set(`db.music.${message.guild.id}.score`, score);
                } else {
                    var skip = data.skip;
                    if (skip == undefined || skip == 0) {
                        skip = 1;
                    } else {
                        skip = skip + 1;
                    }
                    data.skip = skip;
                    await data.save().catch(err => console.log(err));
                }
                var count = data.count;
                var name = data.name[count];
                var vocal = data.vocal[count];
                var link = data.link[count];
                var chack = /(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;
                var yturl = link.replace(chack, '').replace(/(?:&(.+))/gi, '');
                var list = `음악퀴즈를 종료하시려면 \` ;음악퀴즈 종료 \`를 입력해 주세요.`;
                var np = new MessageEmbed()
                    .setTitle(`**정답 : ${name}**`)
                    .setDescription(`**[가수 : ${vocal}](${link})**\n정답자 : ${message.author.username}`)
                    .setImage(`http://img.youtube.com/vi/${yturl}/sddefault.jpg`)
                    .setFooter(`10초뒤에 다음곡으로 넘어갑니다.`)
                    .setColor('ORANGE');
                var channelid = data.channelid;
                var listid = data.listid;
                var npid = data.npid;
                setTimeout(async function() {
                    await play_score(client, message);
                }, 300);
                try {
                    var c = client.channels.cache.get(channelid);
                    c.messages.fetch(listid).then(m => {
                        m.edit(list);
                    });
                    c.messages.fetch(npid).then(m => {
                        m.edit(np);
                    });
                } catch(err) {}
            } catch(err) {
                return await play_end(client, message);
            }
            data.count = data.count + 1;
            await data.save().catch(err => console.log(err));
            setTimeout(async function() {
                try {
                    var c = client.channels.cache.get(data.voicechannelid);
                } catch(err) {
                    try {
                        var c = message.guild.me.voice.channel.id;
                    } catch(err) {
                        var c = message.member.voice.channel.id;
                    }
                }
                return await play(client, c, message);
            }, 10000);
        });
    },
}
