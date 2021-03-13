
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
    play_ready: async function play_ready (client, message, args, voiceChannel, emerr, music_list) {
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
            
            if (args[2]) {
                if (!isNaN(args[2])) {
                    if (args[2] > 50) {
                        emerr.setDescription(`한번에 최대 50곡까지 가능합니다.`);
                        return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                    }
                    if (args[2] < 2) {
                        emerr.setDescription(`최소 2곡이상만 가능합니다.`);
                        return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                    }
                    try {
                        await clearInterval(ontimer);
                    } catch(err) {}
                    data.voicechannelid = voiceChannel.id;
                    await data.save().catch(err => console.log(err));
                    play_set(client, message);
                    if (!music_list['complite']) {
                        emerr.setDescription(`
                            아직 이 주제가 완성되지 않았습니다.

                            ;음악퀴즈 주제로 다른 주제를 확인해보세요.
                        `);
                        return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                    }
                    var url = music_list['url'];
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
                            if (args[2] > name.length) {
                                emerr.setDescription(`입력한 곡수가 너무 많습니다.\n최대 ${name.length}곡`);
                                play_end(client, message);
                                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                            }
                            var ect = data.ect;
                            if (ect == undefined || ect == null) {
                                ect = [];
                            }
                            var rl = [];
                            var nl = [];
                            var vl = [];
                            var ll = [];
                            var e = false;
                            var tt = '';
                            for (i=0; i<args[2];i++) {
                                if (args[2] > name.length-ect.length) {
                                    emerr.setDescription(`제외된 곡이 너무 많습니다.\n;음악퀴즈 초기화 를 입력해서 제외된 곡을 없애주세요.`);
                                    message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                                    play_end(client, message);
                                    e = true;
                                    break;
                                }
                                var r = Math.floor(Math.random() * (parseInt(name.length+1)));
                                if (rl.includes(r) || ect.includes(name[r]) || name[r] == '') {
                                    i--;
                                    continue;
                                }
                                // console.log(`${i+1}. ${vocal[r]}-${name[r]}  [${r}]`);
                                tt += `${i+1}. ${vocal[r]}-${name[r]}  [${r}]\n`;
                                rl.push(r);
                                ect.push(name[r]);
                                nl.push(name[r]);
                                vl.push(vocal[r]);
                                ll.push(link[r]);
                            }
                            if (e) return ;
                            console.log(tt);
                            data.ect = ect;
                            data.name = nl;
                            data.vocal = vl;
                            data.link = ll;
                            data.count = 0;
                            data.start = true;
                            await data.save().catch(err => console.log(err));
                            play(client, voiceChannel, message);
                        }
                        setTimeout(async function() {
                            var ontimer = await setInterval(async function() {
                                if (!(message.guild.me.voice.channel == data.voicechannelid)) {
                                    await play_end(client, message);
                                    return await clearInterval(ontimer);
                                }
                            }, 100);
                        }, 1000);
                    });
                    return ;
                }
                emerr.setDescription(`곡수는 숫자만 입력가능합니다.\n;음악퀴즈 명령어`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            emerr.setDescription(`시작 <주제> <곡수>\n곡수를 입력하지 않았습니다.\n;음악퀴즈 명령어`);
            return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
        });
    },
}
