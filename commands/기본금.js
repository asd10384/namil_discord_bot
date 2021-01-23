
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: '기본금',
    aliases: [],
    description: '기본금 지급',
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
        
        // if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        const give = new MessageEmbed()
            .setTitle(`\` 기본급 지급완료 \``)
            .setFooter(`${pp}돈 , ${pp}주식 명령어`)
            .setColor('RANDOM');
        const err = new MessageEmbed()
            .setTitle(`\` 기본급 지급오류 \``)
            .setFooter(`${pp}돈 , ${pp}주식 명령어`)
            .setColor('RED');
        
        var user = message.member.user;
        var normal = await db.get(`db.기본금.${user.id}`);
        if (normal == (null || undefined)) {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var week = date.getDay();
            var hour = date.getHours();
            var min = date.getMinutes();
            var sec = date.getSeconds();
            if (week == 0) week = '일';
            if (week == 1) week = '월';
            if (week == 2) week = '화';
            if (week == 3) week = '수';
            if (week == 4) week = '목';
            if (week == 5) week = '금';
            if (week == 6) week = '토';
            var nowtime = `${year}년 ${month}월 ${day}일(${week}요일) ${hour}시 ${min}분 ${sec}초`;
            await db.set(`db.기본금.${user.id}`, nowtime);
            await db.set(`db.money.${user.id}`, 5000000);
            give.setDescription(`
                \` ${user.username} \` 님에게
                기본금 \` 5,000,000 \`원을
                지급해 드렸습니다.
            `);
            return message.channel.send(give).then(m => msgdelete(m, msg_time+2000));
        }
        err.setDescription(`
            \` 이미 기본급을 지급받으셧습니다. \`

            \` 지급일 : ${normal} \`
        `);
        return message.channel.send(err).then(m => msgdelete(m, msg_time+1000));
    },
};
