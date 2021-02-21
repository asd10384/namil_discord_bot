
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

const { dbset, dbset_music } = require('../modules/functions');
const { play_anser } = require('../modules/music/play_anser');
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
// await data.save().catch(err => console.log(err));

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
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            var text = args.join(' ').trim().toLowerCase();

            var count = data.count;
            var name = data.name[count];
            var vocal = data.vocal[count];
            
            var anl = data.anser_list;
            var anser = ``;
            if (anl[data.anser] == '제목') {
                anser = `${name}`.trim().toLowerCase();
            }
            if (anl[data.anser] == '가수') {
                anser = `${vocal}`.trim().toLowerCase();
            }
            if (anl[data.anser] == '제목-가수') {
                anser = `${name}-${vocal}`.trim().toLowerCase();
            }
            if (anl[data.anser] == '가수-제목') {
                anser = `${vocal}-${name}`.trim().toLowerCase();
            }

            if (text == anser) {
                return play_anser(message, client, args);
            }
            if (text == '스킵' || text == 'skip') {
                var userid = message.author.id;
                var user = await db.get(`db.music.${message.guild.id}.user`);
                if (user[userid] >= 1) {
                    await db.set(`db.music.${message.guild.id}.user`, {});
                    return play_anser(message, client, args);
                }
                user[userid] = 1;
                await db.set(`db.music.${message.guild.id}.user`, user);
                return message.channel.send(`스킵하려면 한번더 입력해주세요.`).then(m => msgdelete(m, 1500));
            }
        });
    },
};
