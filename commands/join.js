
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'join',
    aliases: ['j'],
    description: 'join voice channel',
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
            .setTitle(`${pp}join [voice channel id]`)
            .setColor('RANDOM');
        const vc = new MessageEmbed()
            .setTitle(`음성채널을 찾을수 없습니다.`)
            .setColor('RANDOM');

        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));
        
        const channelid = args[0];
        const channel = client.channels.cache.get(channelid);
        try {
            channel.join();
        } catch (error) {
            return message.channel.send(vc).then(m => msgdelete(m, msg_time));
        }
    },
};
