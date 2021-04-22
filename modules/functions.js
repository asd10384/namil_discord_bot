
require('dotenv').config();
const db = require('quick.db');

const { mongourl } = require('../config.json');
const { connect } = require('mongoose');
connect(process.env.mongourl || mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('./data');
const mData = require('./music_data');

module.exports = {
    nowtime: function (time = new Date()) {
        var year = time.getFullYear();
        var month = time.getMonth()+1;
        var day = time.getDate();
        var hour = time.getHours()+9;
        var min = time.getMinutes();
        var sec = time.getSeconds();
        if (hour >= 24) {
            day++;
            hour = hour - 24;
        }
        var nowtime = {
            'year': year,
            'month': month,
            'day': day,
            'hour': hour,
            'min': min,
            'sec': sec,
            'time': {
                '1': `${year}년 ${month}월 ${day}일 ${hour}시 ${min}분 ${sec}초`,
                '2': `${year}년 ${addzero(month)}월 ${addzero(day)}일 ${addzero(hour)}시 ${addzero(min)}분 ${addzero(sec)}초`,
            },
        };
        return nowtime;
    },
    formatDate: function (date) {
        return new Intl.DateTimeFormat("ko-KR").format(date);
    },
    dbset: async function (user, money = 0, daily = '없음') {
        const newData = new Data({
            name: user.username,
            userID: user.id,
            lb: 'all',
            money: money,
            daily: daily,
            stock: [
                {
                    이름: '없음',
                    가격: 0,
                    수량: 0
                }
            ],
            tts: true
        });
        return newData.save().catch(err => console.log(err));
    },
    dbset_music: async function (message) {
        const newmData = new mData({
            serverid: message.guild.id,
            channelid: '',
            voicechannelid: '',
            listid: '',
            npid: '',
            scoreid: '',
            ttsid: '',
            name: [],
            vocal: [],
            link: [],
            count: 0,
            skip: 0,
            start: false,
            sthas: false,
            tts: true,
            role: [],
            anser_list: ['제목', '가수', '제목-가수', '가수-제목'],
            anser_time: 10,
            anser: 0
        });
        await db.set(`db.music.${message.guild.id}.user`, {});
        await db.set(`db.music.${message.guild.id}.score`, {});
        return await newmData.save().catch(err => console.log(err));
    },
};

function addzero(num = 1) {
    return num < 10 ? '0' + num : num;
}