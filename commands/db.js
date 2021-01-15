
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: 'db',
    aliases: [''],
    description: 'see all db',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`prefix_${message.guild.id}`);
        if (pp === null) pp = default_prefix;
        
        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        const help = new MessageEmbed()
            .setTitle(`db명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}db [all|전체|확인] : db전체확인
            `)
            .setColor('RANDOM');
        console.log(message.member.roles.cache.some(r => drole.includes(r.name)));
        if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));

        if (args[0] == 'all' || '전체' || '확인') {
            return message.channel.send('아직 준비되지 않았습니다.')
                .then(m => msgdelete(m, msg_time));
        } else {
            return message.channel.send(help).then(m => msgdelete(m, msg_time));
        }
    },
};
