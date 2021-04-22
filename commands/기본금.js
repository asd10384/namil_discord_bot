
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { dbset } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../modules/data.js');

module.exports = {
    name: '기본금',
    aliases: [],
    description: '기본금 지급',
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
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        const emgive = new MessageEmbed()
            .setTitle(`\` 기본급 지급완료 \``)
            .setFooter(`${pp}돈 , ${pp}주식 명령어`)
            .setColor('RANDOM');
        const emerr = new MessageEmbed()
            .setTitle(`\` 기본급 지급오류 \``)
            .setFooter(`${pp}돈 , ${pp}주식 명령어`)
            .setColor('RED');
        
        var user = message.author;
        Data.findOne({
            userID: user.id
        }, (err, data) => {
            if (err) console.log(err);
            if (!data) {
                var dd = new Date();
                var d = `${z(dd.getFullYear())}년${z(dd.getMonth())}월${z(dd.getDate())}일 ${z(dd.getHours())}시${z(dd.getMinutes())}분${z(dd.getSeconds())}초`;
                dbset(user, 5000000, d);
                emgive.setDescription(`
                    \` ${user.username} \` 님에게
                    기본금 \` 5,000,000 \`원을
                    지급해 드렸습니다.
                `);
                return message.channel.send(emgive).then(m => msgdelete(m, msg_time+2000));
            } else {
                if (data.daily === "없음") {
                    data.money += 5000000;
                    var dd = new Date();
                    data.daily = `${z(dd.getFullYear())}년${z(dd.getMonth())}월${z(dd.getDate())}일 ${z(dd.getHours())}시${z(dd.getMinutes())}분${z(dd.getSeconds())}초`;
                    data.save().catch(err => console.log(err));
                    emgive.setDescription(`
                        \` ${user.username} \` 님에게
                        기본금 \` 5,000,000 \`원을
                        지급해 드렸습니다.
                    `);
                    return message.channel.send(emgive).then(m => msgdelete(m, msg_time+2000));
                } else {
                    emerr.setDescription(`
                        \` 이미 기본급을 지급받으셧습니다. \`
            
                        \` 지급일 : ${data.daily} \`
                    `);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time+2000));
                }
            }
        });
        function z(num) {
            return num < 10 ? "0" + num : num;
        }
    },
};
