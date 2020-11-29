
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: '핑 확인',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        let pp = await db.get(`prefix_${message.guild.id}`);
        if (pp === null) pp = default_prefix;

        const ping = new MessageEmbed()
            .setTitle(`🏓 \` ${client.ws.ping} \` ms`)
            .setColor('RANDOM');
        message.channel.send(ping).then(m => msgdelete(m, msg_time));
    },
};
