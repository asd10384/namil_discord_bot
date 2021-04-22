
require('dotenv').config();
const { MessageEmbed } = require('discord.js');
const { default_prefix, mongourl } = require('../../../config.json');

const { play_end } = require('../play_end');

const { dbset, dbset_music } = require('../../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../../music_data');

module.exports = {
    setting_anser: async function setting_anser (client, message, args, em, emerr) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            function msgdelete(m, t) {
                setTimeout(function() {
                    m.delete();
                }, t);
            }

            var anser = data.anser;
            var anl = data.anser_list;
            if (args[2]) {
                if (args[2] == '확인') {
                    em.setTitle(`현재 정답형식`)
                        .setDescription(`${anl[anser]}`);
                    return message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
                }
                if (anl.includes(args[2])) {
                    if (!(anser == anl.indexOf(args[2]))) {
                        data.anser = anl.indexOf(args[2]);
                        await data.save().catch(err => console.log(err));
                        em.setTitle(`\` 정답 형식을 성공적으로 바꿨습니다. \``)
                            .setDescription(`${anl[anser]} => ${anl[anl.indexOf(args[2])]}`);
                        message.channel.send(em).then(m => msgdelete(m, msg_time+3000));
                        return await play_end(client, message);
                    }
                    emerr.setDescription(`이미 ${anl[anser]} 형식으로 되어있습니다.`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
            }
            var text = '';
            for (s in anl) {
                text += `${anl[s]}, `;
            }
            em.setTitle(`\` 음악퀴즈 설정 정답 명령어 \``)
                .setDescription(`
                    \` 명령어 \`
                    ${pp}음악퀴즈 설정 정답 명령어 : 음악퀴즈 설정 정답 명령어 확인

                    ${pp}음악퀴즈 설정 정답 확인 : 현재 정답 형식 확인
                    ${pp}음악퀴즈 설정 정답 [정답형식] : 정답형식으로 정답형식을 설정
                    (정답형식은 ${text.slice(0,-2)})
                `);
            return message.channel.send(em).then(m => msgdelete(m, help_time));
        });
    },
}
