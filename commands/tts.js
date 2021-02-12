
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, textchannel } = require('../config.json');
const ytdl = require('ytdl-core');
var checkyturl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

const { dbset } = require('../functions.js');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../modules/data.js');

module.exports = {
    name: 'tts',
    aliases: ['say', 'ㅅㅅㄴ', 't', 'ㅅ'],
    description: 'tts',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }
        
        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 메인 명령어 \`
                ${pp}tts [messages]

                \` 관련 명령어 \`
                ${pp}join [voice channel id]
                ${pp}leave
            `)
            .setColor('RANDOM');
        const ttscheck = new MessageEmbed()
            .setColor('RED');
        const vcerr = new MessageEmbed()
            .setTitle(`먼저 봇을 음성에 넣고 사용해 주십시오.`)
            .setDescription(`${pp}join [voice channel id]`)
            .setColor('RANDOM');
        const yterr = new MessageEmbed()
            .setTitle(`\` 주소 오류 \``)
            .setDescription(`영상을 찾을수 없습니다.`)
            .setColor('RED');
        const music = new MessageEmbed()
            .setTitle(`\` 재생 오류 \``)
            .setDescription(`현재 노래퀴즈가 진행중입니다.\n노래퀴즈가 끝나고 사용해주세요.`)
            .setColor('RED');

        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
        if (args[0] == 'ban' || args[0] == '밴' || args[0] == '뮤트') {
            if (!(!!message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
            if (args[1]) {
                var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
                if (muser) {
                    var user = muser.user;
                    Data.findOne({
                        userID: user.id
                    }, (err, data) => {
                        if (err) console.log(err);
                        if (!data) {
                            dbset(user);
                            var ttsboolen = true;
                        } else {
                            var ttsboolen = data.tts;
                            data.tts = false;
                            data.save().catch(err => console.log(err));
                        }
                        if (ttsboolen == false) {
                            ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                                .setDescription(`이미 밴 상태입니다.`);
                            return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
                        }
                        var dd = new Date();
                        var d = `${z(dd.getFullYear())}년${z(dd.getMonth())}월${z(dd.getDate())}일 ${z(dd.getHours())}시${z(dd.getMinutes())}분${z(dd.getSeconds())}초`;
                        ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                            .setDescription(`${d}\n이후로 \` 밴 \` 되셨습니다.`);
                        return message.channel.send(ttscheck).then(m => {
                            if (textchannel['tts'].includes(message.channel.id)) {
                                msgdelete(m, msg_time+3000);
                            }
                        });
                    });
                    return ;
                }
                ttscheck.setTitle(`\` TTS오류 \``)
                    .setDescription(`플레이어를 찾을수 없습니다.`);
                return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
            }
            ttscheck.setTitle(`\` TTS오류 \``)
                .setDescription(`${pp}tts ban [player]`);
            return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
        }
        if (args[0] == 'unban' || args[0] == '언밴' || args[0] == '언벤' || args[0] == '해제') {
            if (!(!!message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
            if (args[1]) {
                var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
                if (muser) {
                    var user = muser.user;
                    Data.findOne({
                        userID: user.id
                    }, (err, data) => {
                        if (err) console.log(err);
                        if (!data) {
                            dbset(user, 0);
                            var ttsboolen = true;
                        } else {
                            var ttsboolen = data.tts;
                            data.tts = true;
                            data.save().catch(err => console.log(err));
                        }
                        if (ttsboolen == true) {
                            ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                                .setDescription(`이미 언벤 상태입니다.`);
                            return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
                        }
                        var dd = new Date();
                        var d = `${z(dd.getFullYear())}년${z(dd.getMonth())}월${z(dd.getDate())}일 ${z(dd.getHours())}시${z(dd.getMinutes())}분${z(dd.getSeconds())}초`;
                        ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                            .setDescription(`${d}\n이후로 \` 언밴 \` 되셨습니다.`);
                        return message.channel.send(ttscheck).then(m => {
                            if (textchannel['tts'].includes(message.channel.id)) {
                                msgdelete(m, msg_time+3000);
                            }
                        });
                    });
                    return ;
                }
                ttscheck.setTitle(`\` TTS오류 \``)
                    .setDescription(`플레이어를 찾을수 없습니다.`);
                return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
            }
            ttscheck.setTitle(`\` TTS오류 \``)
                .setDescription(`${pp}tts unban [player]`);
            return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
        }

        var user = message.member.user;
        Data.findOne({
            userID: user.id
        }, (err, data) => {
            if (err) console.log(err);
            if (!data) {
                dbset(user, 0);
                var ttsboolen = true;
            } else {
                var ttsboolen = data.tts;
            }
            if (ttsboolen == false) {
                return ;
            }
            var text = args.join(' ');
            var options = {};
    
            text = text.replace(/\?/gi, '물음표') || text;
            text = text.replace(/\!/gi, '느낌표') || text;
            text = text.replace(/\~/gi, '물결표') || text;
    
            text = text.replace(/\'/gi, '따옴표') || text;
            text = text.replace(/\"/gi, '큰따옴표') || text;
    
            text = text.replace(/\(/gi, '여는소괄호') || text;
            text = text.replace(/\)/gi, '닫는소괄호') || text;
            text = text.replace(/\{/gi, '여는중괄호') || text;
            text = text.replace(/\}/gi, '닫는중괄호') || text;
            text = text.replace(/\[/gi, '여는대괄호') || text;
            text = text.replace(/\]/gi, '닫는대괄호') || text;
    
            text = text.replace(/ㄹㅇ/gi, '리얼') || text;
            text = text.replace(/ㅅㅂ/gi, '시바') || text;
            text = text.replace(/ㄲㅂ/gi, '까비') || text;

            text = text.replace(/ㅅㄱ/gi, '수고') || text;
            text = text.replace(/ㄴㅇㅅ/gi, '나이스') || text;
    
            if (db.get('db.music.tts')) {
                try {
                    if (!!message.member.voice.channel) {
                        var channel = message.member.voice.channel;
                    } else if (!!message.guild.me.voice.channel) {
                        var channel = message.guild.voice.channel;
                    }
        
                    var lang = db.get('db.tts.lang');
                    if (!(!!lang)) {
                        db.set('db.tts.lang', 'ko');
                        lang = 'ko';
                    }
        
                    var url = `http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=${text}&tl=${lang}`;
                    yt(args[0]);
                    const broadcast = client.voice.createBroadcast();
                    channel.join().then(connection => {
                        broadcast.play(url, options);
                        connection.play(broadcast);
                    });
                } catch (error) {
                    return message.channel.send(vcerr).then(m => msgdelete(m, msg_time));
                }
            } else {
                return message.channel.send(music).then(m => msgdelete(m, msg_time));
            }
        });
        
        function yt(utl) {
            if (utl.match(checkyturl)) {
                try {
                    url = ytdl(utl, { bitrate: 512000 });
                    message.delete();
                    options = {
                        volume: 0.06
                    };
                } catch(e) {
                    return message.channel.send(yterr).then(m => msgdelete(m, msg_time));
                }
            }
        }
        function z(num) {
            return num < 10 ? "0" + num : num;
        }
    },
};
