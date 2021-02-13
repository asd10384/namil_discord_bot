
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { play_anser, play_end } = require('../functions.js');
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
    name: 'musicanser',
    aliases: [],
    description: 'anser',
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
        
        // if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

        var text = args.join(' ');

        var count = await db.get('db.music.count');
        var name = await db.get('db.music.name')[count];
        var vocal = await db.get('db.music.vocal')[count];
        var anser = `${vocal}-${name}`.trim().toLowerCase();
        
        if (text == anser) {
            play_anser(message, client);
        }
    },
};
