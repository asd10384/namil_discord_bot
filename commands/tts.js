
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'tts',
    aliases: ['say', 'ㅅㅅㄴ', 't', 'ㅅ'],
    description: 'tts',
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
                \` 메인 명령어 \`
                ${pp}tts [messages]

                \` 관련 명령어 \`
                ${pp}join [voice channel id]
                ${pp}leave
            `)
            .setColor('RANDOM');
        const vcerr = new MessageEmbed()
            .setTitle(`먼저 봇을 음성에 넣고 사용해 주십시오.`)
            .setDescription(`${pp}join [voice channel id]`)
            .setColor('RANDOM');

        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
        let text = args.join(' ');

        try {
            if (message.member.voice.channelID) {
                var channelid = message.member.voice.channelID;
                var channel = client.channels.cache.get(channelid);
            } else if (message.guild.me.voice.channelID) {
                var channelid = message.guild.voice.channelID;
                var channel = client.channels.cache.get(channelid);
            }
            try {
                var url = `http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=${text}&tl=${await db.get('db.tts.lang')}`;
            } catch(error) {
                db.set('db.tts.lang', 'ko');
                var url = `http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=${text}&tl=${await db.get('db.tts.lang')}`;
            }

            const broadcast = client.voice.createBroadcast();
            channel.join().then(connection => {
                broadcast.play(url);
                connection.play(broadcast);
            });
        } catch (error) {
            return message.channel.send(vcerr).then(m => msgdelete(m, msg_time));
        }
    },
};
