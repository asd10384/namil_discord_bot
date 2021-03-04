
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, textchannel } = require('../config.json');

const { play_end } = require('../modules/music/play_end');
const { dbset, dbset_music } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../modules/music_data');
/*
Data.findOne({
    serverid: message.guild.id
}, async function (err, data) {
    if (err) console.log(err);
    if (!data) {
        await dbset_music(message);
    }
});
*/

module.exports = {
    name: 'musicquizset',
    aliases: ['음악퀴즈기본설정'],
    description: 'setting',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, default_prefix);
            pp = default_prefix;
        }
        
        const per = new MessageEmbed()
            .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
            .setColor('RED');
        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>data.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
            
            await play_end(client, message);
            return message.guild.channels.create(`🎵음악퀴즈`, { // ${client.user.username}-음악퀴즈채널
                type: 'text',
                topic: `정답은 채팅으로 치시면 됩니다.`
            }).then(c => {
                data.channelid = c.id;
                var anser = data.anser_list[data,anser];
                var time = data.time;
                var score = new MessageEmbed()
                    .setTitle(`**[ 음악퀴즈 스코어 ]**`)
                    .setDescription(`**없음**\n\n스킵한 노래 : 없음`)
                    .setFooter(`스코어는 다음게임 전까지 사라지지 않습니다.`)
                    .setColor('ORANGE');
            var list = `**[ 규칙 ]**
    **1.** 명령어는 \` ;음악퀴즈 명령어 \` 로 확인하실수 있습니다.
    **2.** 정답은 채팅창에 그냥 입력하시면 됩니다.
    **3.** 정답을 맞추고 몇초뒤에 다음곡으로 넘어갈지 설정할수 있습니다. (기본 : 10초)
    (__;음악퀴즈 설정 명령어__ 를 참고해주세요.)
    **4.** 정답은 __;음악퀴즈 설정 정답__ 으로 설정하실수 있습니다. (기본 : 제목)
    **5.** 노래가 끝나도 정답을 맞추지 못할시 자동으로 스킵됩니다.
    (제목 및 가수는 오피셜(멜론) 명칭을 사용했습니다.)
    (가수는 무조건 한글로 적어주세요.)
    (띄어쓰기나 특수문자 ' 를 유의하여 적어주세요.)
    **6.** 음악퀴즈로 나왔던 곡들은 __;음악퀴즈 초기화__ 를
         하기전까지 다시 나오지 않습니다.
    **7.** 오류나 수정사항은 hky4258@naver.com 으로 보내주세요.

    음악퀴즈 도중 봇이 멈추거나 오류가 생겼다면
    음악퀴즈를 종료하고 다시 시작해주세요. (;음악퀴즈 종료)

    음성 채널에 참여한 후 \` 시작 \`을 입력해 음악퀴즈를 시작하세요.`;
                var np = new MessageEmbed()
                    .setTitle(`**현재 음악퀴즈가 시작되지 않았습니다.**`)
                    .setDescription(`\` ;음악퀴즈 설정 \`\n정답형식 : ${anser}\n다음곡시간 : ${time}초`)
                    .setImage(`https://cdn.hydra.bot/hydra_no_music.png`)
                    .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                    .setColor('ORANGE');
                c.send(score).then(m => {
                    data.scoreid = m.id;
                    data.save().catch(err => console.log(err));
                });
                c.send(list).then(m => {
                    data.listid = m.id;
                    data.save().catch(err => console.log(err));
                });
                c.send(np).then(m => {
                    data.npid = m.id;
                    data.save().catch(err => console.log(err));
                });
            });
        });
    },
};
