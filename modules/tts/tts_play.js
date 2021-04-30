
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, textchannel } = require('../../config.json');

const ytdl = require('ytdl-core');
var checkyturl = /(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
var checkytid = /(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;

const { tts_msg } = require('./tts_msg');
const { dbset, dbset_music } = require('../functions');
const { connect } = require('mongoose');
const { seturl, ttsstart } = require('./seturl');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../data');
const mData = require('../music_data');

module.exports = {
    tts_play: async function tts_play (client, message, args, vcerr, yterr, music) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
            }, t);
        }

        var checktimer = await db.get(`db.${message.guild.id}.tts.timercheck`);
        if (!checktimer) {
            await db.set(`db.${message.guild.id}.tts.timercheck`, true);
            await ttstimer(message, dataa);
        }
        db.set(`db.${message.guild.id}.tts.timertime`, 600);

        mData.findOne({
            serverid: message.guild.id
        }, async function (errr, dataa) {
            if (!dataa) {
                await dbset_music(message);
            }

            var user = message.member.user;
            Data.findOne({
                userID: user.id
            }, async (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    dbset(user, 0);
                    var ttsboolen = true;
                } else {
                    var ttsboolen = data.tts;
                }
                if (ttsboolen == false) {
                    try {
                        setTimeout(() => {
                            return message.delete();
                        }, 50);
                    } catch(err) {}
                    return ;
                }
                var text = args.join(' ');
                var options = {};
        
                var url = '없음';
                if (text.match(checkyturl)) {
                    try {
                        url = ytdl(`https://youtu.be/${text.replace(checkytid, '')}`, { bitrate: 512000 });
                        options = {
                            volume: 0.08
                        };
                        message.delete();
                    } catch(e) {
                        return message.channel.send(yterr).then(m => msgdelete(m, msg_time));
                    }
                }
        
                if (dataa.tts) {
                    try {
                        if (!!message.member.voice.channel) {
                            var channel = message.member.voice.channel;
                        } else if (!!message.guild.me.voice.channel) {
                            var channel = message.guild.voice.channel;
                        }

                        if (url == '없음') {
                            return seturl(message, channel, text, options);
                        }
                        return ttsstart(message, channel, url, options);
                    } catch (error) {
                        return message.channel.send(vcerr).then(m => msgdelete(m, msg_time));
                    }
                } else {
                    return message.channel.send(music).then(m => msgdelete(m, msg_time));
                }
            });
        });
    },
};

async function ttstimer(message, dataa) {
    setInterval(async () => {
        if (dataa.start) return;
        var time = await db.get(`db.${message.guild.id}.tts.timertime`);
        if (time == undefined || time == null) time = 600;
        var on = await db.get(`db.${message.guild.id}.tts.timeron`) || false;
        if (on) {
            if (time <= 0) {
                await db.set(`db.${message.guild.id}.tts.timeron`, false);
                await db.set(`db.${message.guild.id}.tts.timertime`, 600);
                try {
                    message.guild.me.voice.channel.leave();
                } catch(err) {}
            } else {
                await db.set(`db.${message.guild.id}.tts.timertime`, time-5);
            }
        } else {
            await db.set(`db.${message.guild.id}.tts.timeron`, false);
            await db.set(`db.${message.guild.id}.tts.timertime`, 600);
        }
    }, 5000);
}