
const db = require('quick.db');
const { MessageEmbed, Collection } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { play_start } = require('../modules/music/ready/play_start');
const { play_anser } = require('../modules/music/start/play_anser');
const { play_end } = require('../modules/music/play_end');
const { play_setting } = require('../modules/music/play_setting/play_setting');

const { dbset, dbset_music } = require('../modules/functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

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
    description: 'musicquiz',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
            }, t);
        }
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }
        
        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        
        const em = new MessageEmbed()
            .setColor('ORANGE');
        const emerr = new MessageEmbed()
            .setTitle(`오류`)
            .setColor('RED');
        const help = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}음악퀴즈 시작 : 음악퀴즈를 시작합니다.
                ${pp}음악퀴즈 설정 : 정답형식이나 시간을 설정할수 있습니다.
                ${pp}음악퀴즈 중지 : 진행중인 음악퀴즈를 멈춥니다.

                \` 관리자 명령어 \`
                ${pp}음악퀴즈 기본설정 : 음악퀴즈 채널을 생성합니다.
                ${pp}음악퀴즈 스킵 : 현재 곡을 강제로 스킵합니다.
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

            if (args[0] == '시작' || args[0] == 'start') {
                // 음성확인
                if (!await checkvc(message, data, emerr)) return ;

                var startmsg = await db.get(`db.music.${message.guild.id}.startmsg`);
                if (startmsg == undefined || startmsg == null) startmsg = false;
                if (!startmsg) {
                    await db.set(`db.music.${message.guild.id}.startmsg`, true);
                    return await play_start(client, message, args, voiceChannel);
                } else {
                    emerr.setDescription(`
                        이미 음악퀴즈 시작을 입력하셨습니다.

                        **${default_prefix}음악퀴즈 종료**
                        를 입력하신뒤 다시 시도해주세요.
                    `);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
            }
            if (args[0] == '설정' || args[0] == 'setting') {
                // 음성확인
                if (!await checkvc(message, data, emerr)) return ;

                return await play_setting(client, message, args, em, emerr);
            }
            if (args[0] == '종료' || args[0] == '중단' || args[0] == '중지' || args[0] == 'stop') {
                // 음성확인
                if (!await checkvc(message, data, emerr)) return ;

                await db.set(`db.music.${message.guild.id}.startmsg`, false);
                return play_end(client, message);
            }
            if (args[0] == '스킵' || args[0] == 'skip') {
                // 음성확인
                if (!await checkvc(message, data, emerr)) return ;

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
            if (args[0] == '명령어' || args[0] == '도움말' || args[0] == 'help') {
                return message.channel.send(help).then(m => msgdelete(m, 4000));
            }
        });

        async function checkvc(message, data, emerr) {
            var voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                emerr.setDescription(`음성채널에 들어간 뒤 사용해주세요.`);
                message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                return false;
            }
            try {
                data.voicechannelid = voiceChannel.id;
                await data.save().catch(err => console.log(err));
            } catch(err) {}
            return true;
        }
    },
};
