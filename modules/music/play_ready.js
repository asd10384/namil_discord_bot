
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const request = require("request");
const cheerio = require("cheerio");

const { play } = require('./play');
const { play_end } = require('./play_end');
const { play_set } = require('./play_set');

const { msg_time, help_time, mongourl } = require('../../config.json');
const { dbset, dbset_music } = require('../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../music_data');

module.exports = {
    play_ready: async function play_ready (client, message, args, voiceChannel, url='', complite=false) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            const emerr = new MessageEmbed()
                .setTitle(`오류`)
                .setColor('RED');

            try {
                clearInterval(ontimer);
            } catch(err) {}
            try {
                data.voicechannelid = voiceChannel.id;
                await data.save().catch(err => console.log(err));
            } catch(err) {}
            if (!complite) {
                emerr.setDescription(`
                    아직 이 주제가 완성되지 않았습니다.

                    ;음악퀴즈 주제로 다른 주제를 확인해보세요.
                `);
                await play_end(client, message);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            await play_set(client, message);
            try {
                var c = client.channels.cache.get(data.channelid);
                c.messages.fetch(data.npid).then(m => {
                    m.reactions.removeAll();
                    m.react('💡');
                    m.react('⏭️');
                });
            } catch(err) {}
            request(url, async function (err, res, html) {
                if (!err) {
                    var $ = cheerio.load(html);
                    var name = [];
                    var vocal = [];
                    var link = [];
                    $('body div.music div').each(function () {
                        var n = $(this).children('a.name').text().trim();
                        var v = $(this).children('a.vocal').text().trim();
                        var l = $(this).children('a.link').text().trim();
                        name.push(n);
                        vocal.push(v);
                        link.push(l);
                    });
                    var rl = [];
                    var nl = [];
                    var vl = [];
                    var ll = [];
                    var tt = '';
                    var count = name.length;
                    if (count > 50) count = 50;
                    for (i=0; i<count; i++) {
                        var r = Math.floor(Math.random() * (parseInt(name.length+1)));
                        if (rl.includes(r) || name[r] == '') {
                            i--;
                            continue;
                        }
                        tt += `${i+1}. ${vocal[r]}-${name[r]}  [${r}]\n`;
                        rl.push(r);
                        nl.push(name[r]);
                        vl.push(vocal[r]);
                        ll.push(link[r]);
                    }
                    console.log(tt);
                    data.name = nl;
                    data.vocal = vl;
                    data.link = ll;
                    data.count = 0;
                    data.start = true;
                    await data.save().catch(err => console.log(err));
                    play(client, voiceChannel, message);
                }
                setTimeout(async function() {
                    var ontimer = setInterval(async function () {
                        if (!(message.guild.me.voice.channel == data.voicechannelid)) {
                            await play_end(client, message);
                            return clearInterval(ontimer);
                        }
                    }, 100);
                }, 1000);
            });
            return ;
        });
        return ;
    },
}
