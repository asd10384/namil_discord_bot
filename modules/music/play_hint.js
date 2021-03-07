
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

const { mongourl } = require('../../config.json');
const { dbset, dbset_music } = require('../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../music_data');

module.exports = {
    play_hint: async function play_hint (client, message, userid) {
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
                if (!(await db.get(`db.music.${message.guild.id}.hintget`))) {
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
                            if (index.includes(i)) {
                                t += `◻️`;
                            } else {
                                t += `${anser[i].toUpperCase()}`;
                            }
                        }
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
}
