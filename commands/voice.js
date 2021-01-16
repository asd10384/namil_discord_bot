
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'voice',
    aliases: ['vo', 'lang', '음성'],
    description: 'change voice',
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

        const info = new MessageEmbed()
            .setTitle(`\` 현재 음성 \``)
            .setColor('RANDOM');

        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 현재 음성 확인 \`
                ${pp}voice info
            
                \` 명령어 확인 \`
                ${pp}voice help

                \` 명령어 \`
                ${pp}voice [lan]
                ex: ${pp}voice 한국어

                \` 사용가능한 음성확인 \`
                ${pp}voice lan
            `)
            .setColor('RANDOM');
        
        const langerr = new MessageEmbed()
            .setTitle(`\` 음성를 잘못 입력하셧습니다. \``)
            .setDescription(`입력한 음성 : \` ${args[0]} \``)
            .setFooter(`음성확인 : ${pp}voice lan`)
            .setColor('RANDOM');
        
        const langfin = new MessageEmbed()
            .setTitle(`\` 음성변경 완료 \``)
            .setColor('RANDOM');

        const langhelp = new MessageEmbed()
            .setTitle(`\` 음성확인 \``)
            .setFooter(`ex: ${pp}voice 한국어`)
            .setColor('RANDOM');

        var langlist = {
            '한국어': "ko",
            '영어': "en",
            '일본어': "ja",
            '중국어': "zh-TW",
            '독일어': "de",
            '러시아어': "ru",
            '프랑스어': "fr",
            '네덜란드어': "nl",
            "아랍어": "ar",
        };

        try {
            var be = await db.get('db.tts.lang');
            var belangtext = Object.keys(langlist).find(key => langlist[key] === be);
        } catch(error) {
            var belangtext = '한국어';
        }
        info.setDescription(`${belangtext}\n\n\` 명령어 확인 \`\n${pp}voice help`);

        if (!args[0]) return message.channel.send(info).then(m => msgdelete(m, msg_time));

        if (args[0] === 'info') return message.channel.send(info).then(m => msgdelete(m, msg_time));
        if (args[0] === 'help') return message.channel.send(help).then(m => msgdelete(m, help_time));
        if (args[0] === 'lan' || args[0] === '확인') {
            text = '';
            for (key in langlist) {
                text += '\` ' + key + ' \`\n';
            }
            langhelp.setDescription(text);
            return message.channel.send(langhelp).then(m => msgdelete(m, help_time));
        }
        if (langlist[args[0]]) {
            var now = langlist[args[0]];
            var nowlangtext = Object.keys(langlist).find(key => langlist[key] === now);
            await db.set('db.tts.lang', now);
            langfin.setDescription(`\` ${belangtext} \` -> \` ${nowlangtext} \``);
            message.channel.send(langfin).then(m => msgdelete(m, msg_time));
        } else {
            return message.channel.send(langerr).then(m => msgdelete(m, msg_time));
        }
    },
};
