
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl, textchannel } = require('../config.json');

const { dbset } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../modules/data.js');

/*
Data.findOne({
    userID: user.id
}, (err, data) => {
    if (err) console.log(err);
    if (!data) {
        dbset(user, 0);
        var money = 0;
    } else {
        var money = data.money;
    }
    bal.setTitle(`\` ${user.username} \`님의 금액`)
        .setDescription(`\` ${money} \`원`);
    message.channel.send(bal).then(m => msgdelete(m, msg_time+2000));
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
        
        if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        return message.guild.channels.create(`🎵음악퀴즈`, { // ${client.user.username}-음악퀴즈채널
            type: 'text',
            topic: `정답은 채팅으로 치시면 됩니다.`,
            parent: textchannel.category,
            position: 0
        }).then(c => {
            db.set('db.music.channel', c.id);
            var score = new MessageEmbed()
                .setTitle(`**[ 음악퀴즈 스코어 ]**`)
                .setDescription(`**없음**\n\n스킵한 노래 : 없음`)
                .setFooter(`스코어는 다음게임 전까지 사라지지 않습니다.`)
                .setColor('ORANGE');
            var list = `__**[ 규칙 ]**__
**1.** 명령어는 \` ${pp}음악퀴즈 명령어 \` 로 확인하실수 있습니다.
**2.** 정답은 채팅창에 그냥 입력하시면 됩니다.
**3.** 정답은 가수-제목 순서로 쓰시면 됩니다. (중간에 - 도 입력해주세요.)
(제목 및 가수는 오피셜(멜론) 명칭을 사용했습니다.)
(가수는 무조건 한글로 적어주세요.)
(띄어쓰기나 특수문자 ' 를 유의하여 적어주세요.)
**4.** 오류나 수정사항은 hky4258@naver.com 으로 보내주세요.

음성 채널에 참여한 후 \` 시작 \`을 입력해 음악퀴즈를 시작하세요.`;
            var np = new MessageEmbed()
                .setTitle(`**현재 음악퀴즈가 시작되지 않았습니다.**`)
                .setDescription(`[노래목록 사이트](https://ytms.netlify.app)`)
                .setImage(`https://cdn.hydra.bot/hydra_no_music.png`)
                .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                .setColor('ORANGE');
            c.send(score).then(m => {
                db.set('db.music.scoreid', m.id);
            });
            c.send(list).then(m => {
                db.set('db.music.listid', m.id);
            });
            c.send(np).then(m => {
                db.set('db.music.npid', m.id);
            });
        });
    },
};
