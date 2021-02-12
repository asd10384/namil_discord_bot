
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { dbset } = require('../functions.js');
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
        
        return message.guild.channels.create(`:musical_note:음악퀴즈`, { // ${client.user.username}-음악퀴즈채널
            type: 'text',
            topic: `정답은 채팅으로 치시면 됩니다.`
        }).then(c => {
            db.set('db.music.channel', c.id);
            var list = `음성 채널에 참여한 후 \` ;음악퀴즈 시작 \`를 입력해 음악퀴즈를 시작하세요.`;
            var np = new MessageEmbed()
                .setTitle(`**현재 음악퀴즈가 시작되지 않았습니다.**`)
                .setDescription(`[노래목록 사이트](https://ytms.netlify.app)`)
                .setImage(`https://cdn.hydra.bot/hydra_no_music.png`)
                .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                .setColor('ORANGE');
            c.send(list).then(m => {
                db.set('db.music.listid', m.id);
            });
            c.send(np).then(m => {
                db.set('db.music.npid', m.id);
            });
        });
    },
};
