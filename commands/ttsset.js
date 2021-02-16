
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { dbset, dbset_music } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Data = require('../modules/music_data');
/*
const Data = require('../modules/music_data');
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
    name: 'ttsset',
    aliases: [],
    description: 'tts채널 생성',
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
        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
            
            setTimeout(async function() {
                return message.guild.channels.create(`💬텍스트음성변환`, { // ${client.user.username}-음악퀴즈채널
                    type: 'text',
                    topic: `봇을 사용한뒤 ;leave 명령어를 입력해 내보내 주세요.`
                }).then(c => {
                    data.ttsid = c.id;
                    data.save().catch(err => console.log(err));
                    var tts = new MessageEmbed()
                        .setTitle(`채팅을 읽어줍니다.`)
                        .setDescription(`이 채팅방에 채팅을 치시면 봇이 읽어줍니다.\n다쓰고 난뒤에는 ;leave를 입력해 봇을 내보내주세요.`)
                        .setFooter(`기본 명령어 : ;tts`)
                        .setColor('ORANGE');
                    c.send(tts);
                });
            }, 200);
        });
    },
};
