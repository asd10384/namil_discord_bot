
const db = require('quick.db');
const { MessageEmbed, Collection } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { dbset, dbset_music } = require('../modules/functions');
const { play } = require('../modules/music/play');
const { play_anser } = require('../modules/music/play_anser');
const { play_end } = require('../modules/music/play_end');
const { play_set } = require('../modules/music/play_set');
const { play_score } = require('../modules/music/play_score');

const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const request = require("request");
const cheerio = require("cheerio");
const { readdirSync } = require('fs');
const { join } = require('path');

const Data = require('../modules/music_data');
/*
Data.findOne({
    serverid: message.guild.id
}, async function (err, data) {
    if (err) console.log(err);
    if (!data) {
        await dbset_music(message);
    }
});
*/
// await data.save().catch(err => console.log(err));

module.exports = {
    name: 'musicquiz',
    aliases: ['음악퀴즈', '노래퀴즈'],
    description: 'play',
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
        
        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        
        const emerr = new MessageEmbed()
            .setTitle(`오류`)
            .setColor('RED');
        const em = new MessageEmbed()
            .setTitle(`설명`)
            .setColor('RED');
        const help = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}음악퀴즈 시작 <숫자> : <숫자>곡만큼 음악퀴즈를 시작합니다.
                ${pp}음악퀴즈 중지 : 진행중인 음악퀴즈를 멈춥니다.
                ${pp}음악퀴즈 초기화 : 앞서나왔던곡들도 다시 나오도록 초기화 합니다.

                \` 관리자 명령어 \`
                ${pp}음악퀴즈 기본설정 : 음악퀴즈 채널을 생성합니다.
                ${pp}음악퀴즈 스킵 : 현재 곡을 스킵합니다.
                ${pp}음악퀴즈 오류수정 [채널아이디] : 텍스트 채널을 다시 생성합니다.
            `)
            .setColor('RED');
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            client.commands = new Collection();
            const commandFiles = readdirSync(join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(join(__dirname, '../commands', `${file}`));
                client.commands.set(command.name, command);
            }

            var voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                emerr.setDescription(`음성채널에 들어간 뒤 사용해주세요.`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '시작' || args[0] == 'start') {
                if (args[1]) {
                    if (!isNaN(args[1])) {
                        if (args[1] > 50) {
                            emerr.setDescription(`한번에 최대 50곡까지 가능합니다.`);
                            return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                        }
                        if (args[1] < 2) {
                            emerr.setDescription(`최소 2곡이상만 가능합니다.`);
                            return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                        }
                        try {
                            await clearInterval(ontimer);
                        } catch(err) {}
                        data.voicechannelid = voiceChannel.id;
                        await data.save().catch(err => console.log(err));
                        play_set(client, message);
                        var url = `http://ytms.netlify.app`;
                        request(url, async function (err, res, html) {
                            if (!err) {
                                var $ = cheerio.load(html);
                                var name = [];
                                var vocal = [];
                                var link = [];
                                $('body div.music div').each(function () {
                                    var n = $(this).children('a.name').text().trim();
                                    var v = $(this).children('a.vocal').text().trim();
                                    var l = $(this).children('a.link').text().trim();
                                    name.push(n);
                                    vocal.push(v);
                                    link.push(l);
                                });
                                if (args[1] > name.length) {
                                    emerr.setDescription(`입력한 곡수가 너무 많습니다.\n최대 ${name.length}곡`);
                                    play_end(client, message);
                                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                                }
                                var ect = data.ect;
                                if (ect == undefined || ect == null) {
                                    ect = [];
                                }
                                var rl = [];
                                var nl = [];
                                var vl = [];
                                var ll = [];
                                var e = false;
                                var tt = '';
                                for (i=0; i<args[1];i++) {
                                    if (args[1] > name.length-ect.length) {
                                        emerr.setDescription(`제외된 곡이 너무 많습니다.\n${pp}음악퀴즈 초기화 를 입력해서 제외된 곡을 없애주세요.`);
                                        message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                                        play_end(client, message);
                                        e = true;
                                        break;
                                    }
                                    var r = Math.floor(Math.random() * (parseInt(name.length+1)));
                                    if (rl.includes(r) || ect.includes(name[r]) || name[r] == '') {
                                        i--;
                                        continue;
                                    }
                                    // console.log(`${i+1}. ${vocal[r]}-${name[r]}  [${r}]`);
                                    tt += `${i+1}. ${vocal[r]}-${name[r]}  [${r}]\n`;
                                    rl.push(r);
                                    ect.push(name[r]);
                                    nl.push(name[r]);
                                    vl.push(vocal[r]);
                                    ll.push(link[r]);
                                }
                                if (e) return ;
                                console.log(tt);
                                data.ect = ect;
                                data.name = nl;
                                data.vocal = vl;
                                data.link = ll;
                                data.count = 0;
                                data.start = true;
                                await data.save().catch(err => console.log(err));
                                play(client, voiceChannel, message);
                            }
                            setTimeout(async function() {
                                var ontimer = await setInterval(async function() {
                                    if (!(message.guild.me.voice.channel == data.voicechannelid)) {
                                        await play_end(client, message);
                                        return await clearInterval(ontimer);
                                    }
                                }, 100);
                            }, 1000);
                        });
                        return ;
                    }
                    emerr.setDescription(`$시작 [곡 개수]\n숫자를 입력해주세요.\n${pp}음악퀴즈 명령어`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
                emerr.setDescription(`시작 [곡 개수]\n숫자를 입력해주세요.\n${pp}음악퀴즈 명령어`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '초기화' || args[0] == 'reset') {
                data.ect = [];
                await data.save().catch(err => console.log(err));
                play_score(client, message);
                play_end(client, message);
                return message.channel.send('완료!').then(m => msgdelete(m, 3000));
            }
            if (args[0] == '종료' || args[0] == '중지' || args[0] == 'stop') {
                return play_end(client, message);
            }
            if (args[0] == '스킵' || args[0] == 'skip') {
                if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                return play_anser(message, client, args);
            }
            if (args[0] == '기본설정') {
                if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                var command = client.commands.get('musicquizset');
                return command.run(client, message, args);
            }
            if (args[0] == '오류수정' || args[0] == '오류확인') {
                if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                if (args[1]) {
                    var channelid = data.channelid;
                    if (!(channelid == args[1])) {
                        try {
                            message.guild.channels.cache.get(args[1]).delete();
                        } catch(err) {}
                        play_end(client, message);
                        var command = client.commands.get('musicquizset');
                        command.run(client, message, args);
                        return message.channel.send(`오류가 발견되어 채널을 다시 생성합니다.`).then(m => msgdelete(m, 6500));
                    }
                    play_end(client, message);
                    return message.channel.send(`오류가 발견되지 않았습니다.`).then(m => msgdelete(m, 5500));
                }
                return message.channel.send(`${pp}음악퀴즈 오류확인 [음악퀴즈 채팅 채널 아이디]`).then(m => msgdelete(m, 5500));
            }
            return message.channel.send(help).then(m => msgdelete(m, msg_time));
        });
    },
};
