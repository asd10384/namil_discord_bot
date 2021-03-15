
const { MessageEmbed } = require('discord.js');
const { play_end } = require('./play_end');

module.exports = {
    voice_error: async function voice_error (client, channel, reason) {
        try {
            channel.leave();
        } catch(err) {}
        try {
            client.channels.cache.get(channel.id).leave();
        } catch(err) {}
        return await play_end(client, channel);
    }
}
