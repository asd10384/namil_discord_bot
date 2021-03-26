
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix } = require('../../../config.json');

const { play_ready } = require('./play_ready');
const { play_end } = require('../play_end');

const request = require('request');

module.exports = {
    msg_start: async function msg_start (client, serverid, message, args, num=0, voiceChannel, channelid, npid, first=false) {
        var url = `https://ytms.netlify.app/music_list.js`;
        request(url, async function (err, res, body) {
            if (!err) {
                var mobject = eval(body)[0];
                var fmobject = eval(body)[0];
                var name = Object.keys(mobject);
                var text = [`\n`];

                if (first) {
                    var page = 1;
                    await db.set(`db.music.${serverid}.${page+1}.lastnum`, 1);
                    await db.set(`db.music.${serverid}.${page+2}.lastnum`, 1);
                    try {
                        var c = client.channels.cache.get(channelid);
                        c.messages.fetch(npid).then(m => {
                            m.reactions.removeAll();
                            m.react('⬅️');
                            m.react('1️⃣');
                            m.react('2️⃣');
                            m.react('3️⃣');
                            m.react('4️⃣');
                            m.react('5️⃣');
                            m.react('↩️');
                            m.react('➡️');
                        });
                    } catch(err) {}
                } else {
                    var page = await db.get(`db.music.${serverid}.page`);
                    if (page == undefined || page == null || page < 1) {
                        await db.set(`db.music.${serverid}.page`, 1);
                        page = 1;
                    };
                    if (page == 1) {
                        await db.set(`db.music.${serverid}.${page+1}.lastnum`, 1);
                        await db.set(`db.music.${serverid}.${page+2}.lastnum`, 1);
                        name = Object.keys(mobject);
                    }
                    if (page == 2) {
                        await db.set(`db.music.${serverid}.${page+1}.lastnum`, 1);
                        mobject = await mobj(serverid, mobject, page, num);
                        if (mobject == undefined) {
                            await db.set(`db.music.${serverid}.page`, page-1);
                            return ;
                        }
                        name = Object.keys(mobject);
                    }
                    if (page == 3) {
                        mobject = await mobj(serverid, mobject, page, num);
                        if (mobject == undefined) {
                            await db.set(`db.music.${serverid}.page`, page-1);
                            return ;
                        }
                        name = Object.keys(mobject);
                    }
                    if (page == 4) {
                        mobject = await mobj(serverid, mobject, page, num);
                        if (mobject == undefined) {
                            await db.set(`db.music.${serverid}.page`, page-1);
                            return ;
                        }
                        var lurl = mobject['url'];
                        var complite = mobject['complite'];
                        await db.set(`db.music.${serverid}.page`, 1);
                        await db.set(`db.music.${serverid}.lrpage`, 1);
                        return await play_ready(client, message, args, voiceChannel, lurl, complite);
                    }
                }
                var i = 0, it = '', p = 0;
                while (i < name.length) {
                    if (i != 0 && i % 5 == 0) p++;
                    it = await bignum((i+1)-(p*5));
                    text[p] += `${it}　${name[i]}\n`;
                    i++;
                }

                var lrpage = await db.get(`db.music.${serverid}.lrpage`);
                if (lrpage == undefined) lrpage = 1;
                if (fmobject === mobject) text[lrpage-1] = `오류가 발생했습니다.\n\n${default_prefix}음악퀴즈 시작을\n다시 입력해주세요.`;

                var np = new MessageEmbed()
                    .setTitle(`**음악퀴즈 선택화면**`)
                    .setDescription(`
                        \` 아래 숫자을 눌러 선택해주세요. \`
                        ${text[lrpage-1]}
                        
                        (아래 이모지가 전부 로딩된 뒤 선택해주세요.)
                    `)
                    .setFooter(`기본 명령어 : ${default_prefix}음악퀴즈 명령어`)
                    .setColor('ORANGE');
                try {
                    var c = client.channels.cache.get(channelid);
                    c.messages.fetch(npid).then(m => {
                        m.edit(np);
                    });
                } catch(err) {}
            } else {
                return await play_end(client, message);
            }
        });
        return ;

        async function mobj(serverid, mobject, page=2, num=0) {
            if (page == 2) {
                var lastnum1 = await db.get(`db.music.${serverid}.${page-1}.lastnum`);
                if (num != 0) lastnum1 = num;
                if (lastnum1 > 0) {
                    var name = Object.keys(mobject);
                    return mobject[name[lastnum1-1]];
                }
            }
            if (page == 3) {
                var lastnum1 = await db.get(`db.music.${serverid}.${page-2}.lastnum`);
                var lastnum2 = await db.get(`db.music.${serverid}.${page-1}.lastnum`);
                if (num != 0) lastnum2 = num;
                if (lastnum1 > 0 || lastnum2 > 0) {
                    var name1 = Object.keys(mobject);
                    var name2 = Object.keys(mobject[name1[lastnum1-1]]);
                    return mobject[name1[lastnum1-1]][name2[lastnum2-1]];
                }
            }
            if (page == 4) {
                var lastnum1 = await db.get(`db.music.${serverid}.${page-3}.lastnum`);
                var lastnum2 = await db.get(`db.music.${serverid}.${page-2}.lastnum`);
                var lastnum3 = await db.get(`db.music.${serverid}.${page-1}.lastnum`);
                if (num != 0) lastnum3 = num;
                if (lastnum1 > 0 || lastnum2 > 0 || lastnum3 > 0) {
                    var name1 = Object.keys(mobject);
                    var name2 = Object.keys(mobject[name1[lastnum1-1]]);
                    var name3 = Object.keys(mobject[name1[lastnum1-1]][name2[lastnum2-1]]);
                    return mobject[name1[lastnum1-1]][name2[lastnum2-1]][name3[lastnum3-1]];
                }
            }
        }
        async function bignum(num=1) {
            return num == 1 ? '1️⃣' : num == 2 ? '2️⃣' : num == 3 ? '3️⃣' : num == 4 ? '4️⃣' : '5️⃣';
        }
    }
}
