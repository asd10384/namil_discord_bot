
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { tts_play } = require('../modules/tts/tts_play');
const { tts_ban } = require('../modules/tts/tts_ban');
const { tts_unban } = require('../modules/tts/tts_unban');

const { dbset, dbset_music } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// const Data = require('../modules/data');
const mData = require('../modules/music_data');

module.exports = {
    name: 'tts',
    aliases: ['say', 'ㅅㅅㄴ', 't', 'ㅅ'],
    description: 'tts',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
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

        mData.findOne({
            serverid: message.guild.id
        }, async function (errr, dataa) {
            if (!dataa) {
                await dbset_music(message);
            }
            if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
            if (args[0] == 'ban' || args[0] == '밴' || args[0] == '뮤트') {
                if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>dataa.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                return await tts_ban(client, message, args, ttscheck);
            }
            if (args[0] == 'unban' || args[0] == '언밴' || args[0] == '언벤' || args[0] == '해제') {
                if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>dataa.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                return await tts_unban(client, message, args, ttscheck);
            }
            return await tts_play(client, message, args, vcerr, yterr, music);
        });
    },
};
