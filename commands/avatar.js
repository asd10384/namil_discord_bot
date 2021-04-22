
require('dotenv').config();
const { formatDate } = require('../modules/functions');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

const Data = require('../modules/music_data');
/*
Data.findOne({
    serverid: message.guild.id
}, async function (err, data) {
    if (err) console.log(err);
    if (!data) {
        await dbset_music(message);
    }
});
*/
// await data.save().catch(err => console.log(err));

module.exports = {
    name: 'avater',
    aliases: ['av','프로필','아바타'],
    description: '플레이어 정보 확인',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
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

        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        
        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 명령어 \`
                ${pp}avatar : 자신의 정보 확인
                ${pp}avatar @User : 유저의 정보 확인
            `)
            .setColor('RANDOM');
        var embed = new MessageEmbed()
            .setColor('RANDOM');

        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            var roles = '';
            var datelist, date;
            
            if (!args[0]) {
                var user = message.member;
                user.roles.cache.forEach((role) => {
                    roles += `${role.name}\n`;
                });
                datelist = formatDate(user.joinedAt).split(/. /g);
                date = `${datelist[0]}년 ${addzero(datelist[1])}월 ${addzero(datelist[2].slice(0,-1))}일`;

                embed.setTitle(`\` ${user.user.username} \` 정보`)
                    .setThumbnail(user.user.displayAvatarURL())
                    .setDescription(`
                        \` 태그 \`
                        ${message.author.tag}

                        \` 서버에 들어온 날짜 \`
                        ${date}
                        
                        \` 아이디 \`
                        ${message.author.id}
                        
                        \` 역할 \`
                        ${roles}
                    `);

                return message.channel.send(embed).then(m => msgdelete(m, help_time + (parseInt(help_time/2))));
            }
            
            var muser = message.guild.members.cache.get(args[0].replace(/[^0-9]/g, ''));
            if (muser) {
                if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                var user = muser;
                var User = message.guild.members.cache.get(user.user.id);
                user.roles.cache.forEach((role) => {
                    roles += `${role.name}\n`;
                });
                datelist = formatDate(user.joinedAt).split(/. /g);
                date = `${datelist[0]}년 ${addzero(datelist[1])}월 ${addzero(datelist[2].slice(0,-1))}일`;

                embed.setTitle(`\` ${user.user.username} \` 정보`)
                    .setThumbnail(User.user.displayAvatarURL())
                    .setDescription(`
                        \` 태그 \`
                        ${User.user.tag}

                        \` 서버에 들어온 날짜 \`
                        ${date}
                        
                        \` 아이디 \`
                        ${User.user.id}
                        
                        \` 역할 \`
                        ${roles}
                    `);

                return message.channel.send(embed).then(m => msgdelete(m, help_time + (parseInt(help_time/2))));
            }
            return message.channel.send(help).then(m => msgdelete(m, msg_time));
        });
    },
};
