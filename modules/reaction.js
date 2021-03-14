
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

const { play_hint } = require('./music/play_hint');
const { play_skip } = require('./music/play_skip');
const { mongourl } = require('../config.json');
const { dbset, dbset_music } = require('./functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('./music_data');

module.exports = {
    creaction: async function creaction (client, reaction, user) {
        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
    
        if (user.bot) return;
        if (!reaction.message.guild) return;
    
        Data.findOne({
            serverid: reaction.message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(reaction.message);
                return ;
            } else {
                if (reaction.message.channel.id === data.channelid) {
                    if (reaction.emoji.name === '💡') {
                        reaction.users.remove(user);
                        return await play_hint(client, reaction.message, user.id);
                    }
                    if (reaction.emoji.name === '⏭️') {
                        reaction.users.remove(user);
                        return await play_skip(client, reaction.message, user.id);
                    }
                }
            }
        });
    }
}
