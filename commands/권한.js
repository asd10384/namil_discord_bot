
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');

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
// await data.save().catch(err => console.log(err));

module.exports = {
    name: '권한',
    aliases: [],
    description: '권한 설정',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                try {
                    m.delete();
                } catch(err) {}
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
        const emerr = new MessageEmbed()
            .setTitle(`오류발생`)
            .setColor('RED');
        const em = new MessageEmbed()
            .setColor('RANDOM');
        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 관리자 명령어 \`
                ${pp}권한 확인 : 봇 관리자 명령어 권한을 확인합니다.
                ${pp}권한 추가 : 봇 관리자 명령어 권한을 추가합니다.
                ${pp}권한 제거 : 봇 관리자 명령어 권한을 제거합니다.
            `)
            .setColor('RANDOM');
        
        if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            if (args[0] == '확인') {
                var roles = data.role;
                var text = '';
                for (i in roles) {
                    text += `<@&${roles[i]}>\n`;
                }
                if (text == '' || text == undefined || text == null) {
                    text = `**없음**`;
                }
                em.setTitle(`\` 봇 사용 권한 \``)
                    .setDescription(text)
                    .setFooter(`${pp}권한 명령어`);
                return message.channel.send(em).then(m => msgdelete(m, help_time - (help_time / 2)));
            }
            if (args[0] == '추가') {
                if (args[1]) {
                    var roles = data.role;
                    var role = message.guild.roles.cache.get(args[1].replace(/[^0-9]/g, '')).id;
                    if (role) {
                        if (!roles.includes(role)) {
                            roles.push(role);
                            data.role = roles;
                            await data.save().catch(err => console.log(err));
                            em.setTitle(`역할을 성공적으로 추가했습니다.`)
                                .setDescription(`추가된 역할 : <@&${role}>`)
                                .setFooter(`${pp}권한 확인`);
                            return message.channel.send(em).then(m => msgdelete(m, help_time - (help_time / 2)));
                        }
                        emerr.setDescription(`이미 추가된 역할입니다.`);
                        return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                    }
                    emerr.setDescription(`역할을 찾을수 없습니다.`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
                emerr.setDescription(`${pp}권한 추가 @역할`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '제거') {
                if (args[1]) {
                    var roles = data.role;
                    var role = message.guild.roles.cache.get(args[1].replace(/[^0-9]/g, '')).id;
                    if (role) {
                        if (roles.includes(role)) {
                            for (i=0; i<roles.length; i++) {
                                if (roles[i] == role) {
                                    roles.splice(i, 1);
                                }
                            }
                            data.role = roles;
                            await data.save().catch(err => console.log(err));
                            em.setTitle(`역할을 성공적으로 제거했습니다.`)
                                .setDescription(`제거된 역할 : <@&${role}>`)
                                .setFooter(`${pp}권한 확인`);
                            return message.channel.send(em).then(m => msgdelete(m, help_time - (help_time / 2)));
                        }
                        emerr.setDescription(`이미 제거된 역할입니다.`);
                        return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                    }
                    emerr.setDescription(`역할을 찾을수 없습니다.`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
                emerr.setDescription(`${pp}권한 제거 @역할`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            return message.channel.send(help).then(m => msgdelete(m, msg_time));
        });
    },
};
