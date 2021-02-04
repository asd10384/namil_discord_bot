
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');
const request = require("request");
const cheerio = require("cheerio");

const { dbset } = require('../functions.js');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../modules/data.js');

/*
Data.findOne({
    userID: user.id
}, (err, data) => {
    if (err) console.log(err);
    if (!data) {
        dbset(user, 0);
        var money = 0;
    } else {
        var money = data.money;
    }
    bal.setTitle(`\` ${user.username} \`님의 금액`)
        .setDescription(`\` ${money} \`원`);
    message.channel.send(bal).then(m => msgdelete(m, msg_time+2000));
});
*/

module.exports = {
    name: '레식',
    aliases: ['r6'],
    description: '레식 플레이어 검색',
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
        
        const help = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}레식 [유저이름] : 유저 검색
                ${pp}레식 [유저이름] 자세히 : 유저 자세히 검색
            `)
            .setColor('RANDOM');
        const nameerr = new MessageEmbed()
            .setTitle(`\` 오류발생 \``)
            .setDescription(`유저 이름을 찾을수 없음`)
            .setFooter(`${pp}레식 [명령어 || 도움말]`)
            .setColor('RED');
        const em = new MessageEmbed()
            .setColor('RANDOM');
        
        // if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        if (args[0]) {
            var url = `http://r6.op.gg/search?search=${args[0]}`;
            request(url, function (err, res, html) {
                if (!err) {
                    var $ = cheerio.load(html);
                    var list = {
                        name: "",
                        img: "",
                        level: "",
                        rank: {
                            img: "",
                            tier: "",
                            mmr: "",
                            kd: ""
                        },
                        stats: {
                            total: {
                                game: "",
                                win: "",
                                lose: "",
                                time: ""
                            },
                            kds: {
                                kill: "",
                                death: "",
                                ss: "",
                                sf: ""
                            },
                            op: {
                                at: "",
                                de: ""
                            }
                        }
                    };
                    var opc = true;
                    var stats_all = false;
                    $("body article main div").each(function () {
                        var name = $(this).children("div.stats__user-info div.name").text().trim();
                        var img = $(this).children("div.stats__profile-img-wrapper img.stats__profile_img").attr("src");
                        var level = $(this).children("div.stats__profile-img-wrapper div.level").text().trim();
                        var rank_img = $(this).children("div.stats__contents-box.stats__contents-rank-box div.rank-img-container img").attr("src");
                        var rank_tier = $(this).children("div.stats__contents-box.stats__contents-rank-box div.right-container div.tier").text().trim();
                        var rank_mmr = $(this).children("div.stats__contents-box.stats__contents-rank-box div.right-container div.mmr").text().trim();
                        var rank_kd = $(this).children("div.stats__contents-box.stats__contents-rank-box div.right-container div.kd").text().trim();
                        
                        if (name) {list['name'] = name;}
                        if (img) {list['img'] = img;}
                        if (level) {list['level'] = level;}
                        if (rank_img) {list['rank']['img'] = rank_img;}
                        if (rank_tier) {list['rank']['tier'] = rank_tier;}
                        if (rank_mmr) {list['rank']['mmr'] = rank_mmr;}
                        if (rank_kd) {list['rank']['kd'] = rank_kd;}

                        if (args[1] == '자세히' || args[1] == 'all') {
                            stats_all = true;
                            var total = $(this).children("div.stats__contents-box.stats__contents-overall-box-content.row div.total-played").text().replace(/ /g, '').split('\n');
                            var kds = $(this).children("div.stats__contents-box.stats__contents-overall-box-content.row div.stats__contents-overall-box-content-values-container div.stats__contents-overall-box-content-values").text().trim().replace(/ /g, '').replace(/kills\//gi, '').replace(/deaths\//gi, '').replace(/Shotsconnected\//gi, '').replace(/shotsfired\//gi, '').split('\n');
                            var op = $(this).children("div.stats__contents-overall-box-content-most div.operator-name").text();

                            if (total[1]) {
                                list['stats']['total']['game'] = total[0].replace(/stats.games/gi, '경기');
                                list['stats']['total']['win'] = total[1].replace(/w/gi, '경기');
                                list['stats']['total']['lose'] = total[2].replace(/l/gi, '경기');
                                list['stats']['total']['time'] = total[3].replace(/h/gi, '시간 ').replace(/m/gi, '분');
                            }
                            if (kds[1]) {
                                if (!kds[2]) {
                                    list['stats']['kds']['kill'] = kds[0];
                                    list['stats']['kds']['death'] = kds[1];
                                } else {
                                    list['stats']['kds']['ss'] = kds[1];
                                    list['stats']['kds']['sf'] = kds[2];
                                }
                            }
                            if (op) {
                                if (opc) {
                                    opc = false;
                                    list['stats']['op']['at'] = op;
                                } else {
                                    list['stats']['op']['de'] = op;
                                }
                            }
                        }
                    });
                    if (!list['name']) {
                        return message.channel.send(nameerr).then(m => msgdelete(m, msg_time));
                    }
                    em.setTitle(`\` 이름 \` : ${list['name']}`)
                        .setURL(url)
                        .setThumbnail(list['img']);
                    
                    if (stats_all) {
                        em.setDescription(`
                            \` 레벨 \` : ${list['level']}

                            \` 티어 \` : ${list['rank']['tier']}
                            \` 점수 \` : ${list['rank']['mmr']}
                            \` KD \` : ${list['rank']['kd']}

                            \` 멀티플레이 \`
                            \` 킬 \` : ${list['stats']['kds']['kill']}
                            \` 데스 \` : ${list['stats']['kds']['death']}
                            \` 명중 \` : ${list['stats']['kds']['ss']}
                            \` 발포 \` : ${list['stats']['kds']['sf']}

                            \` 가장 많이 사용한 오퍼레이터 \`
                            \` 공격 \` : ${list['stats']['op']['at']}
                            \` 방어 \` : ${list['stats']['op']['de']}
                        `);
                        var time = help_time + Math.ceil(help_time / 2);
                    } else {
                        em.setDescription(`
                            \` 레벨 \` : ${list['level']}

                            \` 티어 \` : ${list['rank']['tier']}
                            \` 점수 \` : ${list['rank']['mmr']}
                            \` KD \` : ${list['rank']['kd']}
                        `)
                        .setFooter(`자세한 내용 : ${pp}레식 ${args[0]} 자세히`);
                        var time = help_time + 2000;
                    }
                    
                    return message.channel.send(em).then(m => msgdelete(m, time));
                }
            });
            return;
        }
        return message.channel.send(help).then(m => msgdelete(m, msg_time));
    },
};
