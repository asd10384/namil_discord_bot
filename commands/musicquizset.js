
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, textchannel } = require('../config.json');

const { msg_score, msg_list, msg_np } = require('../modules/music/play_msg');
const { play_end } = require('../modules/music/play_end');
const { dbset, dbset_music } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
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

module.exports = {
    name: 'musicquizset',
    aliases: ['음악퀴즈기본설정'],
    description: 'setting',
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
            
            return message.guild.channels.create(`🎵음악퀴즈`, { // ${client.user.username}-음악퀴즈채널
                type: 'text',
                topic: `정답은 채팅으로 치시면 됩니다.`
            }).then(async c => {
                data.channelid = c.id;
                var anser = data.anser_list[data.anser];
                var time = data.anser_time;
                var score = await msg_score();
                var list = await msg_list();
                var np = await msg_np(anser, time);
                c.send(score).then(async m => {
                    data.scoreid = m.id;
                    await data.save().catch(err => console.log(err));
                });
                c.send(list).then(async m => {
                    data.listid = m.id;
                    await data.save().catch(err => console.log(err));
                });
                c.send(np).then(async m => {
                    m.react('💡');
                    m.react('⏭️');
                    data.npid = m.id;
                    await data.save().catch(err => console.log(err));
                });
                setTimeout(async () => {
                    await play_end(client, message);
                }, 3000);
            });
        });
    },
};
