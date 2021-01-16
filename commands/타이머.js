
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: '타이머',
    aliases: ['timer'],
    description: 'timer',
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

        const help = new MessageEmbed()
            .setTitle(`${pp}타이머 [00:00:00]`)
            .setColor('RANDOM');
        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));

        let timelist = args[0].split(':');
        if (!timelist[0] || !timelist[1] || !timelist[2]) 
            return message.channel.send(help).then(m => msgdelete(m, msg_time));
        
        let time = parseInt(timelist[0] * 3600) + parseInt(timelist[1] * 60) + parseInt(timelist[2]);
        message.channel.send(`타이머 시작!`)
            .then(msg => {
                var timer = time;

                function addzero(num) {
                    if (num < 10) {
                        num = '0' + num;
                    }
                    return num;
                }

                ttimer = setInterval(() => {
                    const embed = new MessageEmbed()
                        .setColor('RANDOM');
                    let hou = parseInt(timer / 60 / 60);
                    let min = parseInt(timer / 60 % 60);
                    let sec = parseInt(timer % 60);
                    if (timer > 20 && timer % 5 == 0) {
                        embed
                            .setTitle(`\` ${addzero(hou)}:${addzero(min)}:${addzero(sec)} \``)
                            .setFooter(`5초마다 시간표시`);
                            msg.edit(embed);
                    }
                    else if (timer > 5 && timer <= 20 && timer % 2 == 0) {
                        embed
                            .setTitle(`\` ${addzero(hou)}:${addzero(min)}:${addzero(sec)} \``)
                            .setFooter(`2초마다 시간표시`);
                        msg.edit(embed);
                    }
                    else if (timer <= 5) {
                        embed
                            .setTitle(`\` ${sec} \``)
                            .setFooter(`1초마다 시간표시`);
                        msg.edit(embed);
                    }
                    timer--;
                    if (timer == 0) {
                        setTimeout(function() {
                            embed
                                .setTitle(`\` 타이머 종료! \``)
                                .setFooter(`-`);
                            msg.edit(embed);
                            clearInterval(ttimer);
                        }, 1000)
                    }
                }, 1000);
            })
            .then(m => msgdelete(m, msg_time));
    },
};
