
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'setprefix',
    aliases: ['sp'],
    description: 'prefix 설정',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
            }, t)
        }
        let pp = await db.get(`db.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }

        const dp = new MessageEmbed()
            .setTitle(`prefix 변경 실패`)
            .setDescription(`권한이 없습니다.`)
            .setColor('RANDOM');
        const np = new MessageEmbed()
            .setTitle(`prefix 변경 실패`)
            .setDescription(`바꿀 prefix를 입력해주세요.\n( ${pp}setprefix [prefix] )`)
            .setColor('RANDOM');
        const tp = new MessageEmbed()
            .setTitle(`prefix 변경 실패`)
            .setDescription(`prefix는 띄어쓰기를 사용하실수 없습니다.`)
            .setColor('RANDOM');
        const sp = new MessageEmbed()
            .setTitle(`prefix 변경 성공`)
            .setColor('RANDOM');
        
        const fbp = db.get(`db.prefix.${message.member.id}`);

        if (!args[0]) return message.channel.send(np).then(m => msgdelete(m, msg_time));
        if(args[1]) return message.channel.send(tp).then(m => msgdelete(m, msg_time));
        db.set(`db.prefix.${message.member.id}`, args[0]);
        const sbp = await db.get(`db.prefix.${message.member.id}`);
        sp.setDescription('` ' + fbp + ' ` -> ` ' + sbp + ' `');
        client.user.setActivity(`${default_prefix}help`);
        message.channel.send(sp).then(m => msgdelete(m, msg_time));
    },
};
