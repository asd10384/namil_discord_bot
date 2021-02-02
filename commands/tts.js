
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
        var text = args.join(' ');

        text = text.replace(/\?/gi, '물음표') || text;
        text = text.replace(/\!/gi, '느낌표') || text;
        text = text.replace(/\~/gi, '물결표') || text;

        text = text.replace(/\'/gi, '따옴표') || text;
        text = text.replace(/\"/gi, '큰따옴표') || text;

        text = text.replace(/\(/gi, '여는소괄호') || text;
        text = text.replace(/\)/gi, '닫는소괄호') || text;
        text = text.replace(/\{/gi, '여는중괄호') || text;
        text = text.replace(/\}/gi, '닫는중괄호') || text;
        text = text.replace(/\[/gi, '여는대괄호') || text;
        text = text.replace(/\]/gi, '닫는대괄호') || text;

        try {
            if (!!message.member.voice.channel) {
                var channel = message.member.voice.channel;
            } else if (!!message.guild.me.voice.channel) {
                var channel = message.guild.voice.channel;
            }

            var lang = await db.get('db.tts.lang');
            if (!(!!lang)) {
                await db.set('db.tts.lang', 'ko');
                lang = 'ko';
            }

            const broadcast = client.voice.createBroadcast();
            channel.join().then(connection => {
                broadcast.play(`http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=${text}&tl=${lang}`);
                connection.play(broadcast);
            });
        } catch (error) {
            return message.channel.send(vcerr).then(m => msgdelete(m, msg_time));
        }
    },
};
