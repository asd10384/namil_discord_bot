
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Collection } = require('discord.js');
const { default_prefix, msg_time, help_time, drole, mongourl } = require('../config.json');
const { readdirSync } = require('fs');
const { join } = require('path');

const { dbset } = require('../modules/functions');
const { connect } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../modules/data.js');

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
    name: '주식',
    aliases: ['stock'],
    description: '주식 명령어',
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
        
        // if (!(message.member.permissions.has(drole))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        mData.findOne({
            serverid: message.guild.id
        }, async function (err, dataa) {
            if (err) console.log(err);
            if (!dataa) {
                await dbset_music(message);
            }
            client.commands = new Collection();

            const commandFiles = readdirSync(join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(join(__dirname, '../commands', `${file}`));
                client.commands.set(command.name, command);
            }

            var command = client.commands.get('kospi');
            command.run(client, message, args);
            
            var command = client.commands.get('kosdaq');
            command.run(client, message, args);

            var tcount = db.get('db.stock.count');
            if (tcount == (null || undefined)) {
                await db.set('db.stock.count', 0);
                var command = client.commands.get('nasdaq');
                return command.run(client, message, args);
            }else if (tcount > 20) {
                await db.set('db.stock.count', 0);
                const nas = new MessageEmbed()
                    .setTitle(`\` 20번 명령어를 입력할때마다\n자동으로 주식 정보 업데이트\``)
                    .setColor('BLUE');
                var command = client.commands.get('nasdaq');
                command.run(client, message, args);
                return message.channel.send(nas).then(m => msgdelete(m, msg_time));
            } else {
                await db.add('db.stock.count', 1);
            }

            const help = new MessageEmbed()
                .setTitle(`주식 명령어`)
                .setDescription(`
                    \` 주식 변동 시간 \`
                    주식은 매일마다 변동됩니다.

                    \` ${pp}나스닥 \` 을 입력하여
                    나스닥 정보를 최신상태로 유지해주세요.

                    \` 유저 명령어 \`
                    ${pp}기본금 : 기본금
                    ${pp}돈 : 돈 확인
                    ${pp}주식 명령어 : 명령어 확인
                    ${pp}주식 보유 : 소지한 주식 확인
                    ${pp}주식 종목 [마켓이름] [page]
                    ${pp}주식 검색 [주식이름] : 주식 정보 확인
                    ${pp}주식 매수 [이름] [수량] : 주식 구매
                    ${pp}주식 매도 [이름] [수량] : 주식 판매

                    \` 관리자 명령어 \`
                    ${pp}주식 보유 [player] : player가 소지한 주식 확인
                `)
                .setColor('RANDOM');
            const stem = new MessageEmbed()
                .setFooter(`${pp}주식 명령어`)
                .setColor('RANDOM');
            const listem = new MessageEmbed()
                .setTitle(`명령어`)
                .setDescription(`
                    \` 명령어 \`
                    ${pp}주식 종목 코스피 [page] : 코스피 주식 확인
                    ${pp}주식 종목 코스닥 [page] : 코스닥 주식 확인
                    ${pp}주식 종목 나스닥 [page] : 나스닥 주식 확인
                `)
                .setColor('RANDOM');
            const lem = new MessageEmbed()
                .setTitle(`주식 종목`)
                .setFooter(`${pp}주식 명령어`)
                .setColor('RANDOM');
            const page = new MessageEmbed()
                .setTitle(`\` 페이지 오류 \``)
                .setColor('RED');
            const serch = new MessageEmbed()
                .setFooter(`${pp}주식 명령어`)
                .setColor('RANDOM');
            const buy = new MessageEmbed()
                .setFooter(`${pp}주식 보유`)
                .setColor('RANDOM');
            const sell = new MessageEmbed()
                .setFooter(`${pp}주식 보유`)
                .setColor('RANDOM');
            
            if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));

            if (args[0] == '보유' || args[0] == 'has') {
                try {
                    var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
                } catch (err) {
                    var muser = undefined;
                }
                if (muser) {
                    if (!(message.member.permissions.has(drole) || message.member.roles.cache.some(r=>dataa.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
                    
                    var user = muser.user;
                    Data.findOne({
                        userID: user.id
                    }, (err, data) => {
                        if (err) console.log(err);
                        if (!data) {
                            dbset(user);
                            var hasstock = '없음';
                        } else {
                            var stock = data.stock;
                            if (stock[0]['이름'] == '없음') {
                                var hasstock = '없음';
                            } else {
                                var hasstock = '';
                                var ap = 0;
                                var hasstock = '[ 주식이름 ] ( 현재가 ) < 수량 > 「 예상수익률 」〔 순수익 〕\n\n';
                                for (i=0; i<stock.length; i++) {
                                    var all = Object.values(db.all()[0]['data']['stock']['all']['kospi'][0][stock[i]['이름']]);
                                    if (!all[0]) {
                                        all = Object.values(db.all()[0]['data']['stock']['all']['kosdaq'][0][stock[i]['이름']]);
                                    }
                                    if (!all[0]) {
                                        all = Object.values(db.all()[0]['data']['stock']['all']['nasdaq'][0][stock[i]['이름']]);
                                    }
                                    var ap = ap + (all[0]*stock[i]['수량'])-(stock[i]['가격']*stock[i]['수량']);
                                    var cv = ((stock[i]['가격'] - all[0]) / 100).toFixed(2);
                                    hasstock += `\`[ ${stock[i]['이름']} ]\`( ${all[0]}원 ) < ${stock[i]['수량']}개 > 「 ${cv}% 」 〔 ${stock[i]['가격']-all[0]}원 〕\n`;
                                }
                                hasstock += `\n\` 평가손익 \` : ${ap}원`;
                            }
                        }
                        stem.setTitle(`\` ${user.username} \`님의 보유주식`)
                            .setDescription(hasstock);
                        return message.channel.send(stem);
                    });
                } else {
                    var user = message.member.user;
                    Data.findOne({
                        userID: user.id
                    }, (err, data) => {
                        if (err) console.log(err);
                        if (!data) {
                            dbset(user);
                            var hasstock = '없음';
                        } else {
                            var stock = data.stock;
                            if (stock[0]['이름'] == '없음') {
                                var hasstock = '없음';
                            } else {
                                var hasstock = '';
                                var ap = 0;
                                var hasstock = '[ 주식이름 ] ( 현재가 ) < 수량 > 「 예상수익률 」〔 순수익 〕\n\n';
                                for (i=0; i<stock.length; i++) {
                                    var all = Object.values(db.all()[0]['data']['stock']['all']['kospi'][0][stock[i]['이름']]);
                                    if (!all[0]) {
                                        all = Object.values(db.all()[0]['data']['stock']['all']['kosdaq'][0][stock[i]['이름']]);
                                    }
                                    if (!all[0]) {
                                        all = Object.values(db.all()[0]['data']['stock']['all']['nasdaq'][0][stock[i]['이름']]);
                                    }
                                    var ap = ap + (all[0]*stock[i]['수량'])-(stock[i]['가격']*stock[i]['수량']);
                                    var cv = ((stock[i]['가격'] - all[0]) / 100).toFixed(2);
                                    hasstock += `\`[ ${stock[i]['이름']} ]\`( ${all[0]}원 ) < ${stock[i]['수량']}개 > 「 ${cv}% 」 〔 ${stock[i]['가격']-all[0]}원 〕\n`;
                                }
                                hasstock += `\n\` 평가손익 \` : ${ap}원`;
                            }
                        }
                        stem.setTitle(`\` ${user.username} \`님의 보유주식`)
                            .setDescription(hasstock);
                        return message.channel.send(stem);
                    });
                }
                return ;
            }
            if (args[0] == '종목' || args[0] == 'list' || args[0] == '목록') {
                var oneallstock = 50;
                if (args[1] == ('코스피' || 'kospi')) {
                    var name = Object(db.all()[0]['data']['stock']['name']['kospi'][0]);
                }
                if (args[1] == ('코스닥' || 'kosdaq')) {
                    var name = Object(db.all()[0]['data']['stock']['name']['kospi'][0]);
                }
                if (args[1] == ('나스닥' || 'nasdaq')) {
                    var name = Object(db.all()[0]['data']['stock']['name']['nasdaq'][0]);
                }
                if (name) {
                    var key = Object.keys(name);
                    var val = Object.values(name);
                    var p = 0;
                    var num = 0;
                    if (args[2]) {
                        if (args[2].replace(/[^0-9]/g,'') <= Math.ceil(key.length / oneallstock) && args[2].replace(/[^0-9]/g,'') > 0) {
                            p = args[2]-1;
                            num = (args[2]-1) * oneallstock;
                        } else {
                            page.setDescription(`페이지는 1~${Math.ceil(key.length / oneallstock)} 중의 숫자로 입력해야합니다.`);
                            return message.channel.send(page).then(m => msgdelete(m, msg_time));
                        }
                    }
                    var text = '';
                    for (i = num; i<num+oneallstock; i++) {
                        text += `${i+1}. \` ${key[i]} \` (코드 : ${val[i]})\n`;
                    }
                    lem.setDescription(text)
                        .setFooter(`페이지 ${p+1} / ${Math.ceil(key.length / oneallstock)}`);
                    return message.channel.send(lem);//.then(m => msgdelete(m, help_time+1000));
                }
                return message.channel.send(listem).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '검색' || args[0] == '확인' || args[0] == 'serch' || args[0] == 'check') {
                var name_kospi = Object(db.all()[0]['data']['stock']['name']['kospi'][0]);
                var name_kosdaq = Object(db.all()[0]['data']['stock']['name']['kosdaq'][0]);
                var name_nasdaq = Object(db.all()[0]['data']['stock']['name']['nasdaq'][0]);

                if (args[1]) {
                    if (name_kospi[args[1]] !== (null || undefined)) {
                        var market = '코스피'
                        var id = name_kospi[args[1]];
                        var all = Object.values(db.all()[0]['data']['stock']['all']['kospi'][0][args[1]]);
                        var image = `http://ssl.pstatic.net/imgfinance/chart/mobile/mini/${id}_end_up_tablet.png`;
                    }
                    if (name_kosdaq[args[1]] !== (null || undefined)) {
                        var market = '코스닥'
                        var id = name_kosdaq[args[1]];
                        var all = Object.values(db.all()[0]['data']['stock']['all']['kosdaq'][0][args[1]]);
                        var image = `http://ssl.pstatic.net/imgfinance/chart/mobile/mini/${id}_end_up_tablet.png`;
                    }
                    if (name_nasdaq[args[1]] !== (null || undefined)) {
                        var market = '나스닥'
                        var id = name_nasdaq[args[1]];
                        var all = Object.values(db.all()[0]['data']['stock']['all']['nasdaq'][0][args[1]]);
                        var image = `http://ssl.pstatic.net/imgfinance/chart/mobile/world/item/day/${id}_end_up_tablet.png`;
                    }
                    if (id) {
                        if (all[1][0] == '-') {
                            var cv = `▼ ${all[1].slice(1)}`;
                        } else {
                            var cv = `▲ ${all[1]}`;
                        }
                        if (all[2][0] == '-') {
                            var cr = `- ${all[2].slice(1)}`;
                        } else {
                            var cr = `+ ${all[2]}`;
                        }
                        serch.setTitle(`주식 검색 : \` ${args[1]} \` [${market}]`)
                            .setImage(image)
                            .setDescription(`
                                \` 시세 \` : ${all[0]}원
                                \` 전일비 \` : ${cv}
                                \` 등락률 \` : ${cr}%
                                \` 시가총액 \` : ${all[3]}원
                                \` 거래량 \` : ${all[4]}원
                            `);
                        return message.channel.send(serch);//.then(m => msgdelete(m, help_time));
                    }
                    serch.setTitle(`\` 이름 입력 오류 \``)
                        .setDescription(`주식을 찾을수 없음`)
                        .setFooter(`${pp}주식 명령어`)
                        .setColor('RED');
                    return message.channel.send(serch).then(m => msgdelete(m, msg_time));
                }
                serch.setTitle(`\` 이름 입력 오류 \``)
                .setDescription(`
                    ${pp}주식 검색 [이름]
                    이름을 입력하지 않음
                `)
                .setFooter(`${pp}주식 명령어`)
                .setColor('RED');
            return message.channel.send(serch).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '매수' || args[0] == 'buy' || args[0] == '구매') {
                if (args[1]) {
                    var name_kospi = Object(db.all()[0]['data']['stock']['name']['kospi'][0]);
                    var name_kosdaq = Object(db.all()[0]['data']['stock']['name']['kosdaq'][0]);
                    var name_nasdaq = Object(db.all()[0]['data']['stock']['name']['nasdaq'][0]);

                    if (name_kospi[args[1]] !== (null || undefined)) {
                        var all = Object.values(db.all()[0]['data']['stock']['all']['kospi'][0][args[1]]);
                    }
                    if (name_kosdaq[args[1]] !== (null || undefined)) {
                        var all = Object.values(db.all()[0]['data']['stock']['all']['kosdaq'][0][args[1]]);
                    }
                    if (name_nasdaq[args[1]] !== (null || undefined)) {
                        var all = Object.values(db.all()[0]['data']['stock']['all']['nasdaq'][0][args[1]]);
                    }
                    if (all) {
                        if (args[2]) {
                            if (args[2].replace(/[^0-9]/g,'') > 0) {
                                var user = message.member.user;
                                var price = all[0];
                                var allprice = price * args[2];
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
                                    if (!(allprice > money)) {
                                        data.money -= allprice;
                                        var userstock = data.stock;
                                        if (userstock[0]['이름'] == '없음') {
                                            userstock = [];
                                        }
                                        var text = '';
                                        if (userstock.length > 0) {
                                            for (i=0; i<userstock.length; i++) {
                                                if (userstock[i]['이름'] == args[1]) {
                                                    count = userstock[i]['수량'];
                                                }
                                                text += `{'이름': '${userstock[i]['이름']}','가격': ${userstock[i]['가격']},'수량': ${userstock[i]['수량']}},`;
                                            }
                                        }
                                        text += `{'이름': '${args[1]}','가격': ${price},'수량': ${args[2]}}`;
                                        data.stock = eval(`[${text}]`);
                                        data.save().catch(err => console.log(err));
                                        buy.setTitle(`\` 구매가 완료되었습니다. \``)
                                            .setDescription(`
                                                \` 구매내역 \`
                                                이름 : ${args[1]}
                                                금액(개당) : ${price}원
                                                총금액 : ${allprice}원
                                                잔액 : ${money - allprice}원
                                            `)
                                        return message.channel.send(buy);//.then(m => msgdelete(m, help_time-1000));
                                    } else {
                                        buy.setTitle(`\` 구매오류 \``)
                                            .setDescription(`
                                                \` 잔액부족 \`
                                                구매비용 : ${allprice}원
                                                잔액 : ${money}원
                                            `)
                                            .setFooter(`${pp}주식 명령어`)
                                            .setColor('RED');
                                        return message.channel.send(buy).then(m => msgdelete(m, msg_time));
                                    }
                                });
                                return;
                            }
                            buy.setTitle(`\` 구매오류 \``)
                            .setDescription(`
                                \` 수량 입력 오류 \`
                            `)
                            .setFooter(`${pp}주식 명령어`)
                            .setColor('RED');
                            return message.channel.send(buy).then(m => msgdelete(m, msg_time));
                        }
                        buy.setTitle(`\` 구매오류 \``)
                        .setDescription(`
                            \` 수량 입력 오류 \`
                            ${pp}주식 구매 [이름] [수량]
                            수량을 입력하지 않음
                        `)
                        .setFooter(`${pp}주식 명령어`)
                        .setColor('RED');
                        return message.channel.send(buy).then(m => msgdelete(m, msg_time));
                    }
                    buy.setTitle(`\` 구매오류 \``)
                    .setDescription(`
                        \` 주식 이름 오류 \`
                        ${pp}주식 구매 [이름] [수량]
                        해당 이름의 주식을
                        찾을수 없음
                    `)
                    .setFooter(`${pp}주식 명령어`)
                    .setColor('RED');
                    return message.channel.send(buy).then(m => msgdelete(m, msg_time));
                }
                buy.setTitle(`\` 구매오류 \``)
                .setDescription(`
                    \` 주식 이름 오류 \`
                    ${pp}주식 구매 [이름] [수량]
                    이름을 입력하지 않음
                `)
                .setFooter(`${pp}주식 명령어`)
                .setColor('RED');
                return message.channel.send(buy).then(m => msgdelete(m, msg_time));
            }
            if (args[0] == '매도' || args[0] == 'sell' || args[0] == '판매') {
                if (args[0]) {
                    var name_kospi = Object(db.all()[0]['data']['stock']['name']['kospi'][0]);
                    var name_kosdaq = Object(db.all()[0]['data']['stock']['name']['kosdaq'][0]);
                    var name_nasdaq = Object(db.all()[0]['data']['stock']['name']['nasdaq'][0]);

                    if (name_kospi[args[1]] !== (null || undefined)) {
                        var all = Object.values(db.all()[0]['data']['stock']['all']['kospi'][0][args[1]]);
                    }
                    if (name_kosdaq[args[1]] !== (null || undefined)) {
                        var all = Object.values(db.all()[0]['data']['stock']['all']['kosdaq'][0][args[1]]);
                    }
                    if (name_nasdaq[args[1]] !== (null || undefined)) {
                        var all = Object.values(db.all()[0]['data']['stock']['all']['nasdaq'][0][args[1]]);
                    }
                    if (all) {
                        if (args[2]) {
                            if (args[2].replace(/[^0-9]/g,'') > 0) {
                                var user = message.member.user;
                                var price = all[0];
                                var allprice = price * args[2];
                                Data.findOne({
                                    userID: user.id
                                }, (err, data) => {
                                    if (err) console.log(err);
                                    if (!data) {
                                        dbset(user, 0);
                                        var money = 0;
                                        var stock = data.stock;
                                    } else {
                                        var money = data.money;
                                        var stock = data.stock;
                                    }
                                    var hasname = [];
                                    for (i=0; i<stock.length; i++) {
                                        hasname.push(stock[i]['이름']);
                                    }
                                    if (hasname.indexOf(args[1]) > -1) {
                                        var text = '';
                                        var done = true;
                                        for (i=0; i<stock.length; i++) {
                                            var hname = stock[i]['이름'];
                                            var hprice = stock[i]['가격'];
                                            var hcount = stock[i]['수량'];
                                            if (hname == args[1] && done) {
                                                done = false;
                                                hcount = hcount - args[2];
                                                if (hcount < 0) {
                                                    sell.setTitle(`\` 판매오류 \``)
                                                        .setDescription(`
                                                            \` 수량오류 \`
                                                            보유수량이 판매수량보다 적음
                                                        `)
                                                        .setColor('RED');
                                                    return message.channel.send(sell).then(m => msgdelete(m, msg_time));
                                                }
                                                if (hcount == 0) {
                                                    continue;
                                                }
                                                data.money += all[0]*args[2];
                                            }
                                            text += `{'이름':'${hname}','가격':${hprice},'수량':${hcount}},`;
                                        }
                                        if (!(!!text)) {
                                            text += `{'이름':'없음','가격':0,'수량':0},`;
                                        }
                                        data.stock = eval(`[${text.slice(0,-1)}]`);
                                        data.save().catch(err => console.log(err));
                                        sell.setTitle(`\` 판매완료 \``)
                                            .setDescription(`
                                                이름 : ${args[1]}
                                                판매금액 : ${all[0]}원
                                                수량 : ${args[2]}개
                                                총 판매금액 : ${all[0]*args[2]}
                                                잔액 : ${money+(all[0]*args[2])}
                                            `)
                                            .setFooter(`${pp}주식 보유`);
                                        return message.channel.send(sell);//.then(m => msgdelete(m, help_time+2000));
                                    }
                                    sell.setTitle(`\` 판매오류 \``)
                                        .setDescription(`
                                            \` 소지주식오류 \`
                                            판매하려는 주식을
                                            소유하고있지 않습니다.
                                        `)
                                        .setFooter(`${pp}주식 보유`)
                                        .setColor('RED');
                                    return message.channel.send(sell).then(m => msgdelete(m, msg_time));
                                });
                                return;
                            }
                            sell.setTitle(`\` 판매오류 \``)
                            .setDescription(`
                                \` 수량 입력 오류 \`
                            `)
                            .setFooter(`${pp}주식 명령어`)
                            .setColor('RED');
                            return message.channel.send(sell).then(m => msgdelete(m, msg_time));
                        }
                        sell.setTitle(`\` 판매오류 \``)
                            .setDescription(`
                                \` 수량 오류 \`
                                ${pp}주식 판매 [이름] [수량]
                                수량을 입력하지 않음
                            `)
                            .setFooter(`${pp}주식 명령어`)
                            .setColor('RED');
                        return message.channel.send(sell).then(m => msgdelete(m, msg_time));
                    }
                    sell.setTitle(`\` 판매오류 \``)
                        .setDescription(`
                            \` 주식 입력 오류 \`
                            해당 이름의 주식을
                            찾을수 없음
                        `)
                        .setFooter(`${pp}주식 명령어`)
                        .setColor('RED');
                    return message.channel.send(sell).then(m => msgdelete(m, msg_time));
                }
                sell.setTitle(`\` 판매오류 \``)
                        .setDescription(`
                            \` 주식 오류 \`
                            ${pp}주식 판매 [이름] [수량]
                            이름을 입력하지 않음
                        `)
                        .setFooter(`${pp}주식 명령어`)
                        .setColor('RED');
                return message.channel.send(sell).then(m => msgdelete(m, msg_time));
            }
            
            return message.channel.send(help);
        });
    },
};
