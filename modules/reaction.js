
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

const { msg_start } = require('./music/msg_start');
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
                const name = reaction.emoji.name;
                const message = reaction.message;
                const serverid = reaction.message.guild.id;
                var page = await db.get(`db.music.${serverid}.page`);
                if (page == undefined || page == null) page = 1;
                if (reaction.message.channel.id === data.channelid) {
                    if (name === '💡') {
                        reaction.users.remove(user);
                        return await play_hint(client, message, user.id);
                    }
                    if (name === '⏭️') {
                        reaction.users.remove(user);
                        return await play_skip(client, message, user.id);
                    }
                    if (name === '⬅️' || name === '➡️') {
                        reaction.users.remove(user);
                        var lrpage = await db.get(`db.music.${serverid}.lrpage`);
                        if (lrpage == undefined || lrpage == null || lrpage == 1) return ;
                        if (name === '⬅️') lrpage-1;
                        if (name === '➡️') lrpage+1;
                        await db.set(`db.music.${serverid}.lrpage`, lrpage);
                        try {
                            var voiceChannel = client.channels.cache.get(data.voicechannelid);
                        } catch(err) {}
                        if (!voiceChannel) {
                            var voiceChannel = message.member.voice.channel;
                        }
                        return await msg_start(client, serverid, message, [], voiceChannel, data.channelid, data.npid);
                    }
                    if (name === '↩️') {
                        reaction.users.remove(user);
                        if (page == 1) return ;
                        await db.set(`db.music.${serverid}.page`, page-1);
                        await db.set(`db.music.${serverid}.lrpage`, 1);
                        try {
                            var voiceChannel = client.channels.cache.get(data.voicechannelid);
                        } catch(err) {}
                        if (!voiceChannel) {
                            var voiceChannel = message.member.voice.channel;
                        }
                        return await msg_start(client, serverid, message, [], voiceChannel, data.channelid, data.npid);
                    }
                    if (name === '1️⃣' || name === '2️⃣' || name === '3️⃣' || name === '4️⃣' || name === '5️⃣') {
                        reaction.users.remove(user);
                        var num = name === '1️⃣' ? 1 : name === '2️⃣' ? 2 : name === '3️⃣' ? 3 : name === '4️⃣' ? 4 : 5;
                        await db.set(`db.music.${serverid}.page`, page+1);
                        await db.set(`db.music.${serverid}.${page}.lastnum`, num);
                        await db.set(`db.music.${serverid}.lrpage`, 1);
                        try {
                            var voiceChannel = client.channels.cache.get(data.voicechannelid);
                        } catch(err) {}
                        if (!voiceChannel) {
                            var voiceChannel = message.member.voice.channel;
                        }
                        return await msg_start(client, serverid, message, [], voiceChannel, data.channelid, data.npid);
                    }
                }
            }
        });
    }
}
