
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: '임베드',
    aliases: ['embed'],
    description: '임베드 제작',
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
            .setTitle(`임베드 명령어`)
            .setDescription(`
                \`색깔확인\`
                ${pp}임베드 [색깔 || color]
                
                \`명령어\`
                ${pp}임베드 [제목] [내용]
                ${pp}임베드 [색깔] [제목]/[내용]
                ${pp}임베드 [색깔] [제목]/[내용]/[출처]
                (제목, 내용, 출처는 / 로 구분합니다.)
            `)
            .setColor('RANDOM');
        
        const colore = new MessageEmbed()
            .setTitle(`임베드 색깔`)
            .setColor('RANDOM');
        
        const colorlist = [
            'DEFAULT',
            'RANDOM',
            'AQUA',
            'GREEN',
            'BLUE',
            'PURPLE',
            'GOLD',
            'ORANGE',
            'RED',
            'GREY',
            'DARKER_GREY',
            'NAVY',
            'DARK_AQUA',
            'DARK_GREEN',
            'DARK_BLUE',
            'DARK_PURPLE',
            'DARK_GOLD',
            'DARK_ORANGE',
            'DARK_RED',
            'DARK_GREY',
            'LIGHT_GREY',
            'DARK_NAVY',
            'LUMINOUS_VIVID_PINK',
            'DARK_VIVID_PINK'
        ];
        const color = {
            DEFAULT: 0,
            RANDOM: 'RANDOM',
            AQUA: 1752220,
            GREEN: 3066993,
            BLUE: 3447003,
            PURPLE: 10181046,
            GOLD: 15844367,
            ORANGE: 15105570,
            RED: 15158332,
            GREY: 9807270,
            DARKER_GREY: 8359053,
            NAVY: 3426654,
            DARK_AQUA: 1146986,
            DARK_GREEN: 2067276,
            DARK_BLUE: 2123412,
            DARK_PURPLE: 7419530,
            DARK_GOLD: 12745742,
            DARK_ORANGE: 11027200,
            DARK_RED: 10038562,
            DARK_GREY: 9936031,
            LIGHT_GREY: 12370112,
            DARK_NAVY: 2899536,
            LUMINOUS_VIVID_PINK: 16580705,
            DARK_VIVID_PINK: 12320855
        };

        if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

        if (!(args[0])) return message.channel.send(help).then(m => msgdelete(m, msg_time+5000));

        if (args[0] === '색깔' || args[0] === 'color') {
            let text = '';
            for (i = 0; i < colorlist.length; i++) {
                text += `${colorlist[i]}\n`;
            }
            colore.setDescription(text);
            return message.channel.send(colore).then(m => msgdelete(m, help_time));
        }

        if (color[args[0].toUpperCase()]) {
            if (!args[1]) {
                const texthelp = new MessageEmbed()
                    .setTitle(`제목을 입력해주세요.`)
                    .setDescription(`사용법 : ${pp}임베드`)
                    .setColor(`RANDOM`);
                return message.channel.send(texthelp).then(m => msgdelete(m, msg_time));
            }
            let text = args.slice(1).join(' ').split('/');
            let c = color[args[0].toUpperCase()];
            if (text[2]) {
                const embed1 = new MessageEmbed()
                    .setAuthor(`${message.author.username}`, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png')
                    .setColor(c)
                    .setTitle(text[0])
                    .setDescription(text[1])
                    .setFooter(text[2]);
                return message.channel.send(embed1);
            }
            const embed1 = new MessageEmbed()
                .setAuthor(`${message.author.username}`, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png')
                .setColor(c)
                .setTitle(text[0])
                .setDescription(text[1]);
            return message.channel.send(embed1);
        } else {
            let text = args.join(' ').split('/');
            if (text[2]) {
                const embed3 = new MessageEmbed()
                    .setAuthor(`${message.author.username}`, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png')
                    .setTitle(text[0])
                    .setDescription(text[1])
                    .setFooter(text[2]);
                return message.channel.send(embed3);
            }
            const embed3 = new MessageEmbed()
                .setAuthor(`${message.author.username}`, 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png')
                .setTitle(text[0])
                .setDescription(text[1]);
            return message.channel.send(embed3);
        }
    },
};
