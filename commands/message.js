
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
    name: 'message',
    aliases: ['msg','메세지'],
    description: '채팅채널에 채팅입력',
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
        
        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        
        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 명령어 \`
                ${pp}message [text]
            `)
            .setColor('RANDOM');

        const err = new MessageEmbed()
            .setTitle(`\` 채널을 찾을수 없습니다. \``)
            .setColor('RANDOM');
        
        const fin = new MessageEmbed()
            .setTitle(`\` 메세지 입력 완료 \``)
            .setColor('RANDOM');
        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
                }
            if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

            if (!(args[0] || args[1])) return message.channel.send(help).then(m => msgdelete(m, msg_time));

            var text = args.slice(1).join(' ');

            var channel = client.channels.cache.get(args[0]);
            channel.send(text)
                .catch(() => {
                    return message.channel.send(err).then(m => msgdelete(m, msg_time));
                })
                .then(() => {
                    fin.setDescription(`
                        \` 채널이름 \`
                        ${channel.name}

                        \` 입력내용 \`
                        ${text}
                    `)
                    return message.channel.send(fin).then(m => msgdelete(m, msg_time));
                });
        });
    },
};
