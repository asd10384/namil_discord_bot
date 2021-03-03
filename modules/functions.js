
const db = require('quick.db');

const { mongourl } = require('../config.json');
const { connect } = require('mongoose');
connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('./data');
const mData = require('./music_data');

module.exports = {
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
            ect: [],
            count: 0,
            skip: 0,
            start: false,
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
