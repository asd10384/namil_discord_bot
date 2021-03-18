
const db = require("quick.db");
const { MessageEmbed } = require("discord.js");
const { default_prefix, msg_time, help_time, drole } = require("../config.json");
const request = require("request");
const cheerio = require("cheerio");

module.exports = {
    name: "nasdaq",
    aliases: ["나스닥"],
    description: "nasdaq",
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
            .setColor("RED");
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

        const mm = new MessageEmbed()
            .setTitle(`\` 나스닥 정보 로딩중... \``)
            .setFooter(`5초마다 바뀝니다.`)
            .setColor("BLUE");
        const mm2 = new MessageEmbed()
            .setTitle(`\` 로딩완료! \``)
            .setColor("BLUE");

        function make_url(pagesize = 20, page = 1) {
            return `https://api.stock.naver.com/stock/exchange/NASDAQ/marketValue?page=${page}&pageSize=${pagesize}`;
        }
        
        var allpage = 26;
        var name = '';
        var all = '';
        var tt_name = [];
        var tt_all = [];

        for (p=1; p<=allpage; p++) {
            nasdaq_name(make_url(60,p));
            nasdaq_all(make_url(60,p));
        }
        var alltime = (allpage * 3) + 5;
        mm.setDescription(`예상시간 ${alltime}초`);
        message.channel.send(mm).then(m => {
            var nasdaq_Interval = setInterval(async function() {
                alltime--;
                if ((alltime % 5 == 0 && alltime >= 5) || alltime < 5) {
                    mm.setDescription(`예상시간 ${alltime}`);
                    m.edit(mm);
                } else if (alltime < 0) {
                    for (i=0; i<tt_name.length; i++) {
                        name += tt_name[i];
                        all += tt_all[i];
                    }
                    await db.set("db.stock.name.nasdaq", eval(`{[{${name.slice(0,-1)}}]}`));
                    await db.set("db.stock.all.nasdaq", eval(`{[{${all.slice(0,-1)}}]}`));
                    m.edit(mm2).then(m => msgdelete(m, 5000));
                    return clearInterval(nasdaq_Interval);
                }
            }, 1000);
        });

        function nasdaq_name(url) {
            var text2 = '';
            request(url, function (err, res, html) {
                var $ = cheerio.load(html);
                $("body").each(function () {
                    var data = $(this);
                    var text = data.text();
                    var res = eval(`[${text}]`)[0]["stocks"];
                        
                    for (i=0; i<res.length; i++) {
                        text2 += `"${res[i]["stockName"]}": "${res[i]["reutersCode"]}",`;
                    }
                });
            });
            setTimeout(function() {
                tt_name.push(text2);
            }, 3000);
        }

        function nasdaq_all(url) {
            var text3 = '';
            request(url, function (err, res, html) {
                var $ = cheerio.load(html);
                $("body").each(function () {
                    var data = $(this);
                    var text = data.text();
                    var res = eval(`[${text}]`)[0]["stocks"];
                        
                    for (i=0; i<res.length; i++) {
                        text3 += `"${res[i]["stockName"]}": {"시세": "${res[i]["openPrice"]}","전일비": "${res[i]["compareToPreviousClosePrice"]}","등락률": "${res[i]["fluctuationsRatio"]}","시가총액": "${res[i]["marketValue"]}","거래량": "${res[i]["accumulatedTradingVolume"]}"},`;
                    }
                });
            });
            setTimeout(function() {
                tt_all.push(text3);
            }, 3000);
        }
    },
};
