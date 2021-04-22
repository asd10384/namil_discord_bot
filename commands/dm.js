
require('dotenv').config();
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
    name: 'dm',
    aliases: ['디엠'],
    description: '디엠 보내기',
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


        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
            
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
                return client.users.cache.get(id).username;
            }
        });
    },
};
