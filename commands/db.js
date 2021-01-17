
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: 'db',
    aliases: ['데이터베이스'],
    description: 'see all db',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`db.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }
        
        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        const help = new MessageEmbed()
            .setTitle(`db명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}db [all] : db전체확인
                ${pp}db [del] : db삭제
            `)
            .setColor('RANDOM');
        const db_em = new MessageEmbed()
            .setTitle(`DB 확인`)
            .setColor('RANDOM');
        const db_del = new MessageEmbed()
            .setTitle(`DB`)
            .setDescription(`\` 삭제완료 \``)
            .setColor('RANDOM');
        
        if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));

        if (args[0] == ('all' || '전체' || '확인')) {
            var db_text = '';
            var db_key_list = Object.keys(db.all()[0]['data']);
            for (i=0; i<db_key_list.length; i++) {
                db_text += `\`${i+1}. ${db_key_list[i]} \``;
                for (j=0; j<Object.keys(db.all()[0]['data'][db_key_list[i]]).length; j++) {
                    var db_user_id = Object.keys(db.all()[0]['data'][db_key_list[i]])[j];
                    db_text += `\n${db_user_id}　:　`;
                    db_text += `${Object.values(db.all()[0]['data'][db_key_list[i]])[j]}\n`;
                    db_text += `( <@!${db_user_id}> )\n`;
                }
                db_text += '\n\n';
            }
            await db_em.setDescription(db_text);
            return message.channel.send(db_em).then(m => msgdelete(m, msg_time));
        }
        if (args[0] == ('del' || '삭제')) {
            await db.delete('db');
            return message.channel.send(db_del).then(m => msgdelete(m, msg_time));
        }
        return message.channel.send(help).then(m => msgdelete(m, msg_time));
    },
};
