
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

module.exports = {
    name: '돈',
    aliases: ['bal', 'money'],
    description: '돈 확인',
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
        const help = new MessageEmbed()
            .setTitle(`money 명령어`)
            .setDescription(`
                \` 유저 명령어 \`
                ${pp}돈 : 돈확인

                \` 관리자 명령어 \`
                ${pp}돈 @[user] : user 돈 확인
                ${pp}돈 give : 돈 추가
                ${pp}돈 remove : 돈 제거
                ${pp}돈 set : 돈 설정
            `)
            .setColor('RANDOM');
        const help_give = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`${pp}money give @[user] [amount]`)
            .setFooter(`${pp}돈 명령어`)
            .setColor('RANDOM');
        const help_remove = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`${pp}money remove @[user] [amount]`)
            .setFooter(`${pp}돈 명령어`)
            .setColor('RANDOM');
        const help_set = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`${pp}money set @[user] [amount]`)
            .setFooter(`${pp}돈 명령어`)
            .setColor('RANDOM');
        const bal = new MessageEmbed()
            .setFooter(`${pp}돈`)
            .setColor('RANDOM');
        
        if (!args[0]) {
            var user = message.member.user;

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
            return;
        }

        if (!(!!message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));

        var muser = message.guild.members.cache.get(args[0].replace(/[^0-9]/g, ''));
        if (muser) {
            var user = muser.user;

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
                return message.channel.send(bal).then(m => msgdelete(m, msg_time+2000));
            });
        }
        if (args[0] == ('give', '추가', '지급', '주기')) {
            if (!(args[1] || args[2])) return message.channel.send(help_give).then(m => msgdelete(m, msg_time));
            var user = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')).user;
            if (!user) return message.channel.send(help_give).then(m => msgdelete(m, msg_time));
            if (isNaN(args[2])) return message.channel.send(help_give).then(m => msgdelete(m, msg_time));

            Data.findOne({
                userID: user.id
            }, (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    dbset(user, Number(args[2]));
                } else {
                    data.money += Number(args[2]);
                    data.save().catch(err => console.log(err));
                }
                bal.setTitle(`\` ${user.username} \`님의 금액`)
                    .setDescription(`\` + ${args[2]} \`원`);
                return message.channel.send(bal).then(m => msgdelete(m, msg_time+2000));
            });
            return;
        }
        if (args[0] == ('remove', '회수', 'take', '제거')) {
            if (!(args[1] || args[2])) return message.channel.send(help_remove).then(m => msgdelete(m, msg_time));
            var user =  message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')).user;
            if (!user) return message.channel.send(help_remove).then(m => msgdelete(m, msg_time));
            if (isNaN(args[2])) return message.channel.send(help_remove).then(m => msgdelete(m, msg_time));

            Data.findOne({
                userID: user.id
            }, (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    dbset(user, Number(-args[2]));
                } else {
                    data.money -= Number(args[2]);
                    data.save().catch(err => console.log(err));
                }
                bal.setTitle(`\` ${user.username} \`님의 금액`)
                    .setDescription(`\` - ${args[2]} \`원`);
                return message.channel.send(bal).then(m => msgdelete(m, msg_time+2000));
            });
            return;
        }
        if (args[0] == ('set', '설정')) {
            if (!(args[1] || args[2])) return message.channel.send(help_set).then(m => msgdelete(m, msg_time));
            var user = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')).user;
            if (!user) return message.channel.send(help_set).then(m => msgdelete(m, msg_time));
            if (isNaN(args[2])) return message.channel.send(help_set).then(m => msgdelete(m, msg_time));

            Data.findOne({
                userID: user.id
            }, (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    dbset(user, Number(args[2]));
                } else {
                    data.money = Number(args[2]);
                    data.save().catch(err => console.log(err));
                }
                bal.setTitle(`\` ${user.username} \`님의 금액`)
                    .setDescription(`\` ${args[2]} \`원`);
                return message.channel.send(bal).then(m => msgdelete(m, msg_time+2000));
            });
            return;
        }

        return message.channel.send(help).then(m => msgdelete(m, msg_time));

    },
};
