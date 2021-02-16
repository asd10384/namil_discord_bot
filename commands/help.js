
const pagination = require('discord.js-pagination');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'help',
    aliases: ['h','명령어','도움말'],
    description: '명령어 확인',
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

        const com1 = new MessageEmbed()
            .setTitle('기본 명령어 모음')
            .addField(`\` ${pp}help [h] \``, '명령어 설명')
            .addField(`\` ${pp}ping [p] \``, '핑 확인')
            .addField(`\` ${pp}setprefix [sp] \``, 'prefix 설정')
            .addField(`\` ${pp}타이머 [timer] \``, '타이머')
            .addField(`\` ${pp}임베드 [embed] \``, '임베드 제작')
            .addField(`\` ${pp}랜덤 [random] \``, '랜덤')
            .setColor('RANDOM');

        const com2 = new MessageEmbed()
            .setTitle('확인 명령어 모음')
            .addField(`\` ${pp}covid [코로나] \``, '국내 코로나 확인')
            .addField(`\` ${pp}avatar [av,프로필] \``, '플레이어 정보 확인')
            .setColor('RANDOM');
        
        const com3 = new MessageEmbed()
            .setTitle('주식 명령어 모음')
            .addField(`\` ${pp}money [bal] \``, '돈 관련 명령어')
            .addField(`\` ${pp}주식 [stock] \``, '주식 관련 명령어')
            .addField(`\` ${pp}기본금 \``, '기본금')
            .setColor('RANDOM');

        const com4 = new MessageEmbed()
            .setTitle('퀴즈 명령어 모음')
            .addField(`\` ${pp}음악퀴즈 기본설정 \``, '음악퀴즈 채널 만들기')
            .addField(`\` ${pp}음악퀴즈 \``, '음악퀴즈 도움말')
            .setColor('RANDOM');

        const com5 = new MessageEmbed()
            .setTitle('음성 명령어 모음')
            .addField(`\` ${pp}ttsset \``, 'tts채널 만들기')
            .addField(`\` ${pp}tts [say,음성] \``, 'text to speech')
            .addField(`\` ${pp}join [j] \``, 'join voice channel')
            .setColor('RANDOM');
        
        const com6 = new MessageEmbed()
            .setTitle('관리자 명령어 모음')
            .addField(`\` ${pp}권한 \``, '명령어 권한 설정')
            .addField(`\` ${pp}dm [디엠] \``, '디엠 보내기')
            .addField(`\` ${pp}message [channel id] [text] \``, '채팅채널에 채팅입력')
            .setColor('RANDOM');

        const pages = [
            com1,
            com2,
            com3,
            com4,
            com5,
            com6,
        ];

        var time = help_time + (pages.length * 1500);
        const emojiList = ["⏪", "⏩"];
        const timeout = time - 5;
        pagination(message, pages, emojiList, timeout)
            .then(m => msgdelete(m, time));
    },
};
