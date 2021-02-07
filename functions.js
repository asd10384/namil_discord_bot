
const { mongourl } = require('./config.json');
const { connect } = require('mongoose');
connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('./modules/data.js');

module.exports = {
    formatDate: function (date) {
        return new Intl.DateTimeFormat("ko-KR").format(date);
    },
    dbset: function (user, money = 0, daily = '없음') {
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
};
