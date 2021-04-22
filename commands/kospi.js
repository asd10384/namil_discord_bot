
require('dotenv').config();
const db = require("quick.db");
const { MessageEmbed } = require("discord.js");
const { default_prefix, msg_time, help_time, drole } = require("../config.json");
const request = require("request");
const cheerio = require("cheerio");

module.exports = {
    name: "kospi",
    aliases: ["코스피"],
    description: "kospi",
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

        function make_url(pagesize = 20, page = 1) {
            return `http://m.stock.naver.com/api/json/sise/siseListJson.nhn?menu=market_sum&sosok=0&pageSize=${pagesize}&page=${page}`;
        }

        var url = make_url(10000, 1);
        
        request(url, function (err, res, html) {
            if (!err) {
                var $ = cheerio.load(html);
                $("body").each(function () {
                    var data = $(this);
                    var text = data.text();
                    var res = eval(`[${text}]`)[0]["result"]["itemList"];
                    
                    var text2 = '';
                    for (i=0; i<res.length; i++) {
                        text2 += `"${res[i]["nm"]}": "${res[i]["cd"]}",`;
                    }
                    var name = eval(`{[{${text2.slice(0,-1)}}]}`);
                    db.set("db.stock.name.kospi", name);

                    var text3 = '';
                    for (i=0; i<res.length; i++) {
                        text3 += `"${res[i]["nm"]}": {"시세": "${res[i]["nv"]}","전일비": "${res[i]["cv"]}","등락률": "${res[i]["cr"]}","시가총액": "${res[i]["mks"]}","거래량": "${res[i]["aq"]}"},`;
                    }
                    var all = eval(`{[{${text3.slice(0,-1)}}]}`);
                    db.set("db.stock.all.kospi", all);
                });
            }
        });
    },
};
