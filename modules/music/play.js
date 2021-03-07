
const ytdl = require('ytdl-core');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { play_end } = require('./play_end');
const { play_score } = require('./play_score');

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
    play: async function play (client, channel, message) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));

            data.tts = false;
            data.start = true;
            await data.save().catch(err => console.log(err));
            var count = data.count;
            var link = data.link[count];
            if (link == undefined || link == null) {
                channel.leave();
                return await play_end(client, message);
            }
            var url = ytdl(link, { bitrate: 512000, quality: 'highestaudio' });
            var options = {
                volume: 0.08
            };
            
            var anser = '';
            try {
                var anl = data.anser_list;
                anser = anl[data.anser];
            } catch(err) {
                data.anser = 0;
                await data.save().catch(err => console.log(err));
                anser = '제목';
            }

            var count = data.count;
            var all_count = data.name.length;
            try {
                var list = `음악퀴즈를 종료하시려면 \` ;음악퀴즈 종료 \`를 입력해주세요.\n힌트를 받으시려면 \` 힌트 \`를 입력해 주세요.\n음악을 스킵하시려면 \` 스킵 \`을 입력해 주세요.`;
                var np = new MessageEmbed()
                    .setTitle(`**정답 : ???**`)
                    .setDescription(`**채팅창에 ${anser} 형식으로 적어주세요.**\n**곡 : ${count+1}/${all_count}**`)
                    .setImage(`https://ytms.netlify.app/question_mark.png`)
                    .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                    .setColor('ORANGE');
                var channelid = data.channelid;
                var listid = data.listid;
                var npid = data.npid;
                try {
                    var c = client.channels.cache.get(channelid);
                    c.messages.fetch(listid).then(m => {
                        m.edit(list);
                    });
                    c.messages.fetch(npid).then(m => {
                        m.edit(np);
                    });
                } catch(err) {}
                channel.join().then(connection => {
                    const dispatcher = connection.play(url, options);
                    dispatcher.on("finish", () => {
                        play_anser(data, client);
                    });
                });
            } catch(err) {
                await play_end(client, message);
            }
        });

        // play_anser 에서 살짝 변형된 함수
        async function play_anser (data, client) {
            try {
                await data.save().catch(err => console.log(err));
                c_anser = '시간초과로 스킵되었습니다.';
                var skip = data.skip;
                if (skip == undefined || skip == 0) {
                    skip = 1;
                } else {
                    skip = skip + 1;
                }
                data.skip = skip;
                await data.save().catch(err => console.log(err));
                var time = 10;
                var count = data.count;
                var all_count = data.name.length;
                var name = data.name[count];
                var vocal = data.vocal[count];
                var link = data.link[count];
                var chack = /(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;
                var yturl = link.replace(chack, '').replace(/(?:&(.+))/gi, '');
                var list = `음악퀴즈를 종료하시려면 \` ;음악퀴즈 종료 \`를 입력해 주세요.`;
                var np = new MessageEmbed()
                    .setTitle(`**정답 : ${name}**`)
                    .setURL(`${link}`)
                    .setDescription(`**가수 : ${vocal}**\n**정답자 : ${c_anser}**\n**곡 : ${count+1} / ${all_count}**`)
                    .setImage(`http://img.youtube.com/vi/${yturl}/sddefault.jpg`)
                    .setFooter(`${time}초뒤에 다음곡으로 넘어갑니다.`)
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
                await db.set(`db.music.${message.guild.id}.user`, []);
                await db.set(`db.music.${message.guild.id}.hint`, []);
                await db.set(`db.music.${message.guild.id}.hintget`, false);
                return await play(client, c, message);
            }, time * 1000);
        }
    },
}
