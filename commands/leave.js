
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'leave',
    aliases: ['l','ㅣ'],
    description: 'leave voice channel',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`prefix_${message.guild.id}`);
        if (pp === null) pp = default_prefix;
        
        const vc = new MessageEmbed()
            .setTitle(`봇이 음성채널에 없습니다.`)
            .setColor('RANDOM');
        
        try {
            message.guild.me.voice.channel.leave();
        } catch (error) {
            return message.channel.send(vc).then(m => msgdelete(m, msg_time));
        }
    },
};
