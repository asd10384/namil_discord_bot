
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: 'nickname',
    aliases: ['닉네임','nick'],
    description: '서버 닉네임 변경',
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
        
        const role = new MessageEmbed()
            .setTitle(`\` 이 명령어를 사용할 권한이 없습니다. \``)
            .setColor('RANDOM');

        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 명령어 \`
                ${pp}nickname [mention] [nick]
            `)
            .setColor('RANDOM');

        const nkerr = new MessageEmbed()
            .setFooter(`${pp}nickname`)
            .setColor('RANDOM');

        const fin = new MessageEmbed()
            .setTitle(`닉네임 변경 완료`)
            .setColor('RANDOM');

        if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(role).then(m => msgdelete(m, msg_time));
    
        if (!(args[0] || args[1])) return message.channel.send(help).then(m => msgdelete(m, msg_time));
    
        var user = message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);
        
        var text = args.slice(1).join(' ');
        var nick1 = nick(user.user.id);

        message.guild.members.cache.get(user.user.id)
            .setNickname(text)
            .catch(() => {
                nkerr.setTitle(`\` 플레이어 \` 를 찾을수 없습니다.`);
                return message.channel.send(nkerr).then(m => msgdelete(m, msg_time));
            })
            .then(() => {
                fin.setDescription(`
                    \` 원래 닉네임 \`
                    ${nick1}

                    \` 바뀐 닉네임 \`
                    ${nick(user.user.id)}
                `)
                return message.channel.send(fin).then(m => msgdelete(m, msg_time));
            });
        
        function nick(id) {
            return message.guild.members.cache.get(id).nickname;
        }
    },
};
