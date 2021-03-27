
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, mongourl } = require('../../../config.json');

const { play_anser } = require('./play_anser');

const { dbset, dbset_music } = require('../../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../../music_data');

module.exports = {
    play_skip: async function play_skip (client, message, userid) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            const em = new MessageEmbed()
                .setColor('ORANGE');

            if (data.start) {
                if (!(await db.get(`db.music.${message.guild.id}.skipget`))) {
                    var count = data.count;
                    var name = data.name[count];
                    var vocal = data.vocal[count];
                    
                    var anl = data.anser_list;
                    var anser = ``;
                    if (anl[data.anser] == '제목') {
                        anser = `${name}`.trim().toLowerCase();
                    }
                    if (anl[data.anser] == '가수') {
                        anser = `${vocal}`.trim().toLowerCase();
                    }
                    if (anl[data.anser] == '제목-가수') {
                        anser = `${name}-${vocal}`.trim().toLowerCase();
                    }
                    if (anl[data.anser] == '가수-제목') {
                        anser = `${vocal}-${name}`.trim().toLowerCase();
                    }
                    
                    var vcms = client.channels.cache.get(data.voicechannelid).members.size;
                    var count = Math.floor(vcms / 2);
                    var user = await db.get(`db.music.${message.guild.id}.user`);
                    var idx = user.indexOf(userid);
                    var text = '';
                    if (idx > -1) {
                        user.splice(idx, 1);
                        text = `\` ${message.member.user.username} \` 님이 스킵을 요청을 취소했습니다.`;
                    } else {
                        user.push(userid);
                        text = `\` ${message.member.user.username} \` 님이 스킵을 요청했습니다.`;
                    }
                    if (user.length >= count) {
                        await db.set(`db.music.${message.guild.id}.skipget`, true);
                        await db.set(`db.music.${message.guild.id}.user`, []);
                        return play_anser(message, client, ['스킵']);
                    }
                    await db.set(`db.music.${message.guild.id}.user`, user);
                    em.setTitle(`스킵 (${user.length} / ${count})`)
                        .setDescription(`${text}\n\n${count-user.length}명이 더 스킵해야합니다.`)
                        .setFooter(`한번더 입력하면 취소됩니다.`);
                    return message.channel.send(em);
                }   
            }
        });
    },
}
