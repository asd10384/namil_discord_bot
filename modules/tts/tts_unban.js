
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, textchannel } = require('../../config.json');

const { dbset, dbset_music, nowtime } = require('../functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../data');
const mData = require('../music_data');

module.exports = {
    tts_unban: async function tts_unban (client, message, args, ttscheck) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
            }, t);
        }

        mData.findOne({
            serverid: message.guild.id
        }, async function (errr, dataa) {
            if (!dataa) {
                await dbset_music(message);
            }
            
            if (args[1]) {
                var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
                if (muser) {
                    var user = muser.user;
                    Data.findOne({
                        userID: user.id
                    }, (err, data) => {
                        if (err) console.log(err);
                        if (!data) {
                            dbset(user, 0);
                            var ttsboolen = true;
                        } else {
                            var ttsboolen = data.tts;
                            data.tts = true;
                            data.save().catch(err => console.log(err));
                        }
                        if (ttsboolen == true) {
                            ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                                .setDescription(`이미 언벤 상태입니다.`);
                            return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
                        }
                        const date = nowtime(new Date());
                        ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                            .setDescription(`${date['time']['2']}\n이후로 \` 해제 \` 되셨습니다.`);
                        return message.channel.send(ttscheck).then(m => {
                            if (!dataa.ttsid === message.channel.id) {
                                msgdelete(m, msg_time+3000);
                            }
                        });
                    });
                    return ;
                }
                ttscheck.setTitle(`\` TTS오류 \``)
                    .setDescription(`플레이어를 찾을수 없습니다.`);
                return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
            }
            ttscheck.setTitle(`\` TTS오류 \``)
                .setDescription(`${pp}tts unban [player]`);
            return message.channel.send(ttscheck).then(m => msgdelete(m, msg_time+3000));
            
            function az(num) {
                return num < 10 ? "0" + num : num;
            }
        });
    },
};
