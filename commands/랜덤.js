
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: '랜덤',
    aliases: ['random'],
    description: '랜덤',
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
                ${pp}랜덤 선택 [text1] [text2] ...
                선택 뒤에 입력한 글자들중에 하나를 선택합니다.

                ${pp}랜덤 순서 [text1] [text2] ...
                순서 뒤에 입력한 글자들을 랜덤한 순서로 정렬합니다.
            `)
            .setColor('RANDOM');
        const err = new MessageEmbed()
            .setTitle(`\` 오류발생 \``)
            .setColor('RANDOM');
        const em = new MessageEmbed()
            .setColor('RANDOM');
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
    
        if (args[0] == ('선택' || 'choice')) {
            if (!args[1]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
            if (!args[2]) {
                err.setDescription(`단어를 2개이상 입력해주세요.`);
                return message.channel.send(err).then(m => msgdelete(m, msg_time));
            }
            var count = args.length-1;
            em.setTitle(`\` 선택완료 \``)
                .setDescription(`\` 결과 \`\n${args[rdc(count)]}`);
            return message.channel.send(em).then(m => msgdelete(m, msg_time+2000));
        }

        if (args[0] == ('순서' || 'sequence')) {
            if (!args[1]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
            if (!args[2]) {
                err.setDescription(`단어를 2개이상 입력해주세요.`);
                return message.channel.send(err).then(m => msgdelete(m, msg_time));
            }
            var count = args.length-1;
            var rl = rds(count);
            var text = '';
            for (i=1; i<=count; i++) {
                var num = (element) => element === i;
                console.log(rl);
                text += `\n${i}. ${args[rl.findIndex(num)+1]}`;
            }
            em.setTitle(`\` 순서선택완료 \``)
                .setDescription(`\` 결과 \`${text}`);
                return message.channel.send(em).then(m => msgdelete(m, msg_time+2000));
        }
        
        function rdc(num = 2) {
            var r = Math.floor(Math.random() * num) + 1;
            if (r == (null || undefined)) {
                return rdc(num);
            }
            return r;
        }
        function rds(num = 2) {
            var rl = [];
            for (i=0; i<num; i++) {
                var r = rdc(num);
                if (rl.includes(r)) {
                    i--;
                    continue;
                }
                rl.push(r);
            }
            return rl;
        }
    },
};
