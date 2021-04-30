
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');

module.exports = {
    name: 'ping',
    aliases: ['핑'],
    description: '핑 확인',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
            }, t)
        }
        let pp = await db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }

        const ping = new MessageEmbed()
            .setTitle(`\` PONG! \``)
            .setDescription(`🏓 \` ${client.ws.ping} \` ms`)
            .setColor('RANDOM');
        return message.channel.send(ping).then(m => msgdelete(m, msg_time));
    },
};
