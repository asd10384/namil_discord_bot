
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { dbset, dbset_music } = require('../modules/functions');
const { play_anser } = require('../modules/music/play_anser');
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
// await data.save().catch(err => console.log(err));

module.exports = {
    name: 'musicanser',
    aliases: [],
    description: 'anser',
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
        const em = new MessageEmbed()
            .setColor('ORANGE');
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            var text = args.join(' ').trim().toLowerCase();

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

            if (text == anser) {
                return play_anser(message, client, args);
            }
            if (text == '스킵' || text == 'skip') {
                var userid = message.author.id;
                var vcms = client.channels.cache.get(data.voicechannelid).members.size;
                var count = Math.floor(vcms / 2);
                var user = await db.get(`db.music.${message.guild.id}.user`);
                var idx = user.indexOf(userid);
                if (idx > -1) {
                    user.splice(idx, 1);
                } else {
                    user.push(userid);
                }
                if (user.length >= count) {
                    await db.set(`db.music.${message.guild.id}.user`, []);
                    return play_anser(message, client, args);
                }
                await db.set(`db.music.${message.guild.id}.user`, user);
                em.setTitle(`스킵 (${user.length} / ${count})`)
                    .setDescription(`${count-user.length}명이 더 스킵해야합니다.`)
                    .setFooter(`한번더 입력하면 취소됩니다.`);
                return message.channel.send(em);
            }
            if (text == '힌트' || text == 'hint') {
                if (!(await db.get(`db.music.${message.guild.id}.hintget`))) {
                    var userid = message.author.id;
                    var vcms = client.channels.cache.get(data.voicechannelid).members.size;
                    var count = Math.floor(vcms / 2);
                    var hint = await db.get(`db.music.${message.guild.id}.hint`);
                    var idx = hint.indexOf(userid);
                    if (idx > -1) {
                        hint.splice(idx, 1);
                    } else {
                        hint.push(userid);
                    }
                    if (hint.length >= count) {
                        await db.set(`db.music.${message.guild.id}.hintget`, true);
                        await db.set(`db.music.${message.guild.id}.hint`, []);
                        var hc = anser.replace(/-/g, '').replace(/ /g, '').length;
                        var index = [];
                        for (i=0; i<Math.floor(hc/2); i++) {
                            var r = Math.floor(Math.random() * hc-1);
                            if (r < 0 || anser[r] == '-' || anser[r] == ' ' || index.includes(r)) {
                                i--;
                                continue;
                            }
                            index.push(r);
                        }
                        var t = '';
                        for (i=0; i<anser.length; i++) {
                            console.log(i, index.includes(i));
                            if (index.includes(i)) {
                                t += `◻️`;
                            } else {
                                t += `${anser[i].toUpperCase()}`;
                            }
                        }
                        console.log(anser,hc,index,t);
                        em.setTitle(`힌트`)
                            .setDescription(`${t}`);
                        return message.channel.send(em);
                    }
                    await db.set(`db.music.${message.guild.id}.hint`, hint);
                    em.setTitle(`힌트 (${hint.length} / ${count})`)
                        .setDescription(`${count-hint.length}명이 더 힌트를 입력해야합니다.`)
                        .setFooter(`한번더 입력하면 취소됩니다.`);
                    return message.channel.send(em);
                }
            }
        });
    },
};
