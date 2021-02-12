
const { mongourl } = require('./config.json');
const { connect } = require('mongoose');
connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('./modules/data.js');

const ytdl = require('ytdl-core');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

module.exports = {
    formatDate: function (date) {
        return new Intl.DateTimeFormat("ko-KR").format(date);
    },
    dbset: function (user, money = 0, daily = '없음') {
        const newData = new Data({
            name: user.username,
            userID: user.id,
            lb: 'all',
            money: money,
            daily: daily,
            stock: [
                {
                    이름: '없음',
                    가격: 0,
                    수량: 0
                }
            ],
            tts: true
        });
        return newData.save().catch(err => console.log(err));
    },
    play_set: async function play_set (client) {
        try {
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
    play: async function play (client, channel) {
        db.set('db.music.tts', false);
        db.set('db.music.start', 'o');
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
            var list = `음악을 스킵하시려면 \` ;음악퀴즈 스킵 \`를 입력해 주세요.`;
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
    play_anser: async function play_anser (message, client) {
        try {
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
            c.messages.fetch(listid).then(m => {
                m.edit(list);
            });
            c.messages.fetch(npid).then(m => {
                m.edit(np);
            });
        } catch(err) {
            return ;
        }
        db.set('db.music.count', db.get('db.music.count')+1);
        setTimeout(async function() { // play 랑 똑같은 문구
            var channel = client.channels.cache.get(await db.get('db.music.voicechannel'));
            db.set('db.music.tts', false);
            db.set('db.music.start', 'o');
            var count = db.get('db.music.count');
            var link = db.get('db.music.link')[count];
            if (link == undefined || link == null) {
                channel.leave();
                // play_end 랑 똑같은 명령어
                await db.set('db.music.name', []);
                await db.set('db.music.vocal', []);
                await db.set('db.music.link', 0);
                await db.set('db.music.count', 0);
                await db.set('db.music.start', 'x');
                await db.set('db.music.tts', true);
                var list = `음성 채널에 참여한 후 \` ;음악퀴즈 시작 \`를 입력해 음악퀴즈를 시작하세요.`;
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
            }
            var url = ytdl(link, { bitrate: 512000 });
            var options = {
                volume: 0.08
            };
            
            try {
                var list = `음악을 스킵하시려면 \` ;음악퀴즈 스킵 \`를 입력해 주세요.`;
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
            } catch(err) {
                return console.log(12);
            }
    
            const broadcast = client.voice.createBroadcast();
            channel.join().then(connection => {
                broadcast.play(url, options);
                connection.play(broadcast);
            });
        }, 10000);
    },
    play_end: async function play_end (client) {
        await db.set('db.music.name', []);
        await db.set('db.music.vocal', []);
        await db.set('db.music.link', 0);
        await db.set('db.music.count', 0);
        await db.set('db.music.start', 'x');
        await db.set('db.music.tts', true);
        var list = `음성 채널에 참여한 후 \` ;음악퀴즈 시작 \`를 입력해 음악퀴즈를 시작하세요.`;
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
    }
};
