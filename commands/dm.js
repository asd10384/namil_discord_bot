
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'dm',
    aliases: ['디엠'],
    description: '디엠 보내기',
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
        
        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 명령어 \`
                ${pp}dm [mention] [text]
            `)
            .setColor('RANDOM');

        const dmerr = new MessageEmbed()
            .setColor('RANDOM');

        const fin = new MessageEmbed()
            .setColor('RANDOM');

        var user = message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);


        if (!user) return message.channel.send(help).then(m => msgdelete(m, msg_time));
    
        if (!args[1]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
        var text = args.slice(1).join(' ');
        
        user.user
            .send(text)
            .catch(() => {
                dmerr.setTitle(`\` ${nick(user.user.id)} \` dm 을 찾을수 없습니다.`);
                message.channel.send(dmerr).then(m => msgdelete(m, msg_time));
            })
            .then(() => {
                fin.setTitle(`\` ${nick(user.user.id)} \` 에게 성공적으로 dm 을 보냈습니다.`)
                    .setDescription(`\` 내용 \`\n\n${text}`);
                message.channel.send(fin).then(m => msgdelete(m, msg_time / 2));
            });
        
        function nick(id) {
            return message.guild.members.cache.get(id).nickname;
        }
    },
};
