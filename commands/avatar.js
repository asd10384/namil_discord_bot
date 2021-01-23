
const { formatDate } = require('../functions.js');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'avater',
    aliases: ['av','프로필','아바타'],
    description: '플레이어 정보 확인',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        function addzero(num) {
            if (num < 10) {
                num = '0' + num;
            }
            return num;
        }
        var pp = db.get(`db.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }
        
        var embed = new MessageEmbed();
        var roles = '';
        var datelist, date;

        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 명령어 \`
                ${pp}avatar help
            `)
            .setColor('RANDOM');

        if (args[0] === 'help') return message.channel.send(help).then(m => msgdelete(m, msg_time));

        if (!message.mentions.users.first()) {
            message.member.roles.cache.forEach((role) => {
                roles += role.name + '\n';
            });
            
            datelist = formatDate(message.member.joinedAt).split(/. /g);
            date = `${datelist[0]}년 ${addzero(datelist[1])}월 ${addzero(datelist[2].slice(0,-1))}일`;
            
            embed.setTitle(`\` ${message.member.user.username} \` 정보`)
                .setThumbnail(message.author.displayAvatarURL())
                .setDescription(`
                    \` 태그 \`
                    ${message.author.tag}

                    \` 서버에 들어온 날짜 \`
                    ${date}
                    
                    \` 아이디 \`
                    ${message.author.id}
                    
                    \` 역할 \`
                    ${roles}
                `)
                .setColor('RANDOM');
            
            return message.channel.send(embed).then(m => msgdelete(m, help_time + (parseInt(help_time/2))));
        }
        let User = message.mentions.members.first();
        User.roles.cache.forEach((role) => {
            roles += role.name + '\n';
        });

        datelist = formatDate(User.joinedAt).split(/. /g);
        date = `${datelist[0]}년 ${addzero(datelist[1])}월 ${addzero(datelist[2].slice(0,-1))}일`;

        embed.setTitle(`\` ${message.guild.members.cache.get(User.id).displayName} \` 님의 정보`)
            .setThumbnail(client.users.cache.get(User.id).displayAvatarURL())
            .setDescription(`
                \` 태그 \`
                ${client.users.cache.get(User.id).tag}

                \` 서버에 들어온 날짜 \`
                ${date}
                
                \` 아이디 \`
                ${User.id}
                
                \` 역활 \`
                ${roles}
            `)
            .setColor('RANDOM');

        return message.channel.send(embed).then(m => msgdelete(m, help_time + (parseInt(help_time/2))));
    },
};
