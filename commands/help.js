
const pagination = require('discord.js-pagination');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: '명령어 확인',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`prefix_${message.guild.id}`);
        if (pp === null) pp = default_prefix;

        const com1 = new MessageEmbed()
            .setTitle('명령어 모음')
            .addField(`\` ${pp}help [h] \``, '명령어 설명')
            .addField(`\` ${pp}ping [p] \``, '핑 확인')
            .addField(`\` ${pp}setprefix [sp] \``, 'prefix 설정')
            .addField(`\` ${pp}타이머 [timer] \``, '타이머')
            .addField(`\` ${pp}임베드 [embed] \``, '임베드 제작')
            .setColor('RANDOM');

        const com2 = new MessageEmbed()
            .setTitle('명령어 모음')
            .addField(`\` ${pp}급식 [meal] \``, '남일고 급식확인')
            .setColor('RANDOM');

        const com3 = new MessageEmbed()
            .setTitle('명령어 모음')
            .addField(`\` ${pp}covid [코로나] \``, '국내 코로나 확인')
            .setColor('RANDOM');

        const pages = [
            com1,
            com2,
            com3
        ];

        const emojiList = ["⏪", "⏩"];
        const timeout = help_time - 5;
        pagination(message, pages, emojiList, timeout)
            .then(m => msgdelete(m, help_time));
    },
};
