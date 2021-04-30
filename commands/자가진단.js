
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

const { hcs } = require('selfcheck');

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

const Data = require('../modules/data');
const mData = require('../modules/music_data');
/*
mData.findOne({
    serverid: message.guild.id
}, async function (err, dataa) {
    if (err) console.log(err);
    if (!dataa) {
        await dbset_music(message);
    }
});
*/
// await data.save().catch(err => console.log(err));

module.exports = {
    name: '자가진단',
    aliases: ['selfcheck','진단'],
    description: '자가진단',
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
        
        mData.findOne({
            serverid: message.guild.id
        }, async function (err, dataa) {
            if (err) console.log(err);
            if (!dataa) {
                await dbset_music(message);
            }
            // if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>dataa.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

            var user = message.member.user;
            Data.findOne({
                userID: user.id
            }, async (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    dbset(user, 0);
                } else {
                    if (!args[0]) {
                        if ((data.selfcheck.name) ? true : false 
                        || (data.selfcheck.password) ? true : false) {
                            hcs({
                                area: data.selfcheck.area,
                                school: data.selfcheck.school,
                                name: data.selfcheck.name,
                                birthday: data.selfcheck.birthday,
                                password: data.selfcheck.password
                            }).then((result) => {
                                message.channel.send(`${message.author.username}님 자가진단 성공\n시간 : ${result.inveYmd}`).then(m => msgdelete(m, msg_time));
                            }).catch((err) => {
                                message.channel.send(`${message.author.username}님 자가진단 실패\n${pp}자가진단 확인 으로 입력사항 오류 확인바람`).then(m => msgdelete(m, msg_time));
                            });
                            return;
                        }
                    }
                    if (args[0] == '도움말') {
                        return message.channel.send(`${pp}자가진단 : 자가진단 실시\n${pp}자가진단 설정 : 자가진단 설정\n${pp}자가진단 확인 : 자가진단 입력한 값 확인`).then(m => msgdelete(m, msg_time));
                    }
                    if (args[0] == '설정') {
                        if (args[1] || args[2] || args[3] || args[4] || args[5]) {
                            data.selfcheck.area = args[1];
                            data.selfcheck.school = args[2];
                            data.selfcheck.name = args[3];
                            data.selfcheck.birthday = args[4];
                            data.selfcheck.password = args[5];
                            data.save().catch(err => console.log(err));
                            return message.channel.send(`${message.author.username}님의 정보 저장 완료\n${pp}자가진단 으로 자가진단 가능`).then(m => msgdelete(m, msg_time));
                        }
                        return message.channel.send(`${pp}자가진단 설정 [도시(부산)] [학교이름(부산남일고등학교)] [본인이름(홍길동)] [본인생일(040101)] [본인자가진단비밀번호(1111)]`).then(m => msgdelete(m, msg_time));
                    }
                    if (args[0] == '확인') {
                        var text = '';
                        var selfcheck = data.selfcheck;
                        var arr = Object.keys(selfcheck);
                        for (i of arr) {
                            if (i == '$init') continue;
                            text += `${i} : ${(i == 'password') ? '\*\*\*\*' :selfcheck[i]}\n`;
                        }
                        return message.channel.send(text).then(m => msgdelete(m, msg_time));
                    }
                    return message.channel.send(`${pp}자가진단 도움말 로 설정가능`).then(m => msgdelete(m, msg_time));
                }
            });
        });
    },
};
