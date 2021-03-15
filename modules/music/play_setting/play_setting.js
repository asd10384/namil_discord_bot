
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, mongourl } = require('../../../config.json');

const { setting_anser } = require('./setting_anser');
const { setting_time } = require('./setting_time');

const { dbset, dbset_music } = require('../../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../../music_data');

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
                    return await setting_anser(client, message, args, em, emerr);
                }
                if (args[1] == '시간') {
                    return await setting_time(client, message, args, em, emerr);
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
