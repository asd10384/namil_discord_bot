
const ytdl = require('ytdl-core');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
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
            var url = ytdl(link, { bitrate: 512000 });
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

            try {
                var list = `음악퀴즈를 종료하시려면 \` ;음악퀴즈 종료 \`를 입력해주세요.\n음악을 스킵하시려면 \` 스킵 \`을 입력해 주세요.`;
                var np = new MessageEmbed()
                    .setTitle(`**정답 : ???**`)
                    .setDescription(`채팅창에 ${anser} 형식으로 적어주세요.`)
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
                const broadcast = client.voice.createBroadcast();
                channel.join().then(connection => {
                    broadcast.play(url, options);
                    connection.play(broadcast);
                });
            } catch(err) {
                await play_end(client, message);
            }
        });
    },
}
