
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, mongourl } = require('../../config.json');

const { play_end } = require('./play_end');

const { dbset, dbset_music } = require('../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../music_data');

module.exports = {
    play_setting: async function play_setting (client, message, args, em, emerr) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            function msgdelete(m, t) {
                setTimeout(function() {
                    m.delete();
                }, t);
            }

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
            emerr.setDescription(`현재 노래퀴즈가 진행중입니다.\n\` ${default_prefix}음악퀴즈 종료\` 로 음악퀴즈를 종료한뒤 명령어를 사용해주세요.`);
            return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
        });
    },
}
