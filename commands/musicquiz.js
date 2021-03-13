
const db = require('quick.db');
const { MessageEmbed, Collection } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, music_list } = require('../config.json');

const { dbset, dbset_music } = require('../modules/functions');
const { play_ready } = require('../modules/music/play_ready');
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
            .setColor('RED');
        const help = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}음악퀴즈 시작 <주제> <숫자> : <주제>의 곡들중 <숫자>곡만큼 음악퀴즈를 시작합니다.
                (자세한내용은 ${pp}음악퀴즈 시작 으로 확인)
                ${pp}음악퀴즈 설정 : 정답형식이나 시간을 설정할수 있습니다.
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

            if (args[0] == '주제') {
                var text = '';
                for (i=0; i<music_list.length; i++) {
                    text += `**${i+1}.** ${music_list[i]['name'][0]}\n`;
                }
                em.setTitle(`\` 주제 확인 \``)
                    .setDescription(`
                        ${text}
                        ${pp}음악퀴즈 시작 <주제> <곡수>
                    `);
                return message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
            }
            if (args[0] == '시작' || args[0] == 'start') {
                if (args[1]) {
                    for (i=0; i<music_list.length; i++) {
                        if (music_list[i]['name'].includes(args[1])) {
                            return play_ready(client, message, args, voiceChannel, emerr, music_list[i]);
                        }
                    }
                    emerr.setDescription(`시작 <주제>\n주제를 찾을수 없습니다.\n${pp}음악퀴즈 주제`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
                emerr.setDescription(`시작 <주제>\n주제를 입력해주세요.\n${pp}음악퀴즈 주제`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '설정' || args[0] == 'setting') {
                if (!data.start) {
                    if (args[1] == '정답') {
                        var anser = data.anser;
                        var anl = data.anser_list;
                        if (args[2]) {
                            if (args[2] == '확인') {
                                em.setTitle(`현재 정답형식`)
                                    .setDescription(`${anl[anser]}`);
                                return message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
                            }
                            if (anl.includes(args[2])) {
                                if (!(anser == anl.indexOf(args[2]))) {
                                    data.anser = anl.indexOf(args[2]);
                                    await data.save().catch(err => console.log(err));
                                    em.setTitle(`\` 정답 형식을 성공적으로 바꿨습니다. \``)
                                        .setDescription(`${anl[anser]} => ${anl[anl.indexOf(args[2])]}`);
                                    message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
                                    return await play_end(client, message);
                                }
                                emerr.setDescription(`이미 ${anl[anser]} 형식으로 되어있습니다.`);
                                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                            }
                        }
                        var text = '';
                        for (s in anl) {
                            text += `${anl[s]}, `;
                        }
                        em.setTitle(`\` 음악퀴즈 설정 정답 명령어 \``)
                            .setDescription(`
                                \` 명령어 \`
                                ${pp}음악퀴즈 설정 정답 명령어 : 음악퀴즈 설정 정답 명령어 확인
    
                                ${pp}음악퀴즈 설정 정답 확인 : 현재 정답 형식 확인
                                ${pp}음악퀴즈 설정 정답 [정답형식] : 정답형식으로 정답형식을 설정
                                (정답형식은 ${text.slice(0,-2)})
                            `);
                        return message.channel.send(em).then(m => msgdelete(m, help_time));
                    }
                    if (args[1] == '시간') {
                        if (args[2]) {
                            var anser_time = data.anser_time;
                            if (!isNaN(args[2])) {
                                var artime = Number(args[2]);
                                if (artime >= 10) {
                                    if (artime <= 60) {
                                        if (!(anser_time == artime)) {
                                            data.anser_time = artime;
                                            await data.save().catch(err => console.log(err));
                                            em.setTitle(`\` 시간을 성공적으로 바꿨습니다. \``)
                                                .setDescription(`${anser_time}초 => ${artime}초`);
                                                message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
                                                return await play_end(client, message);
                                        }
                                        emerr.setDescription(`이미 ${artime}초로 되어있습니다.`);
                                        return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                                    }
                                    emerr.setDescription(`최대 60초까지 설정하실수 있습니다.`);
                                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                                }
                                emerr.setDescription(`최소 10초까지 설정하실수 있습니다.`);
                                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                            }
                            if (args[2] == '확인') {
                                var anser_time = data.anser_time;
                                em.setTitle(`\` 현재설정되어있는 시간확인 \``)
                                    .setDescription(`${anser_time}초`);
                                    return message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
                            }
                        }
                        em.setTitle(`\` 음악퀴즈 설정 시간 명령어 \``)
                            .setDescription(`
                                음악퀴즈 정답을 맞춘 뒤, 다음곡으로 넘어가기 전까지의 시간을 설정합니다.

                                ${pp}음악퀴즈 설정 시간 명령어 : 음악퀴즈 설정 시간 명령어 확인

                                ${pp}음악퀴즈 설정 시간 확인 : 현재 시간 설정 확인
                                ${pp}음악퀴즈 설정 시간 [Seconds] : Seconds 로 시간 설정
                        `);
                        return message.channel.send(em).then(m => msgdelete(m, help_time));
                    }
                    em.setTitle(`\` 음악퀴즈 설정 명령어 \``)
                        .setDescription(`
                            \` 명령어 \`
                            ${pp}음악퀴즈 설정 명령어 : 음악퀴즈 설정 명령어 확인
    
                            ${pp}음악퀴즈 설정 정답 : 음악퀴즈 정답형식 변경
                            ${pp}음악퀴즈 설정 시간 : 음악퀴즈 시간 변경
                        `);
                    return message.channel.send(em).then(m => msgdelete(m, help_time));
                }
                emerr.setDescription(`현재 노래퀴즈가 진행중입니다.\n\` ;음악퀴즈 종료\` 로 음악퀴즈를 종료한뒤 명령어를 사용해주세요.`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '초기화' || args[0] == 'reset') {
                data.ect = [];
                await data.save().catch(err => console.log(err));
                play_end(client, message);
                play_score(client, message);
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
            if (args[0] == '명령어' || args[0] == '도움말' || args[0] == 'help') {
                return message.channel.send(help).then(m => msgdelete(m, msg_time));
            }
        });
    },
};
