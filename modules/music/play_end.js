
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

const { mongourl } = require('../../config.json');
const { dbset, dbset_music } = require('../functions');
const { connect, set } = require('mongoose');
var dburl = process.env.mongourl || mongourl; // config 수정
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('../music_data');

module.exports = {
    play_end: async function play_end (client, message) {
        Data.findOne({
            serverid: message.guild.id
        }, async function (err, data) {
            if (err) console.log(err);
            if (!data) {
                await dbset_music(message);
            }
            // await data.save().catch(err => console.log(err));
            
            data.name = [];
            data.vocal = [];
            data.link = [];
            data.count = 0;
            data.start = false;
            data.tts = true;
            data.skip = 0;
            await db.set(`db.music.${message.guild.id}.user`, []);
            await db.set(`db.music.${message.guild.id}.hint`, []);
            await db.set(`db.music.${message.guild.id}.hintget`, false);
            await db.set(`db.music.${message.guild.id}.score`, {});
            await data.save().catch(err => console.log(err));
            var anser = data.anser_list[data.anser];
            var time = data.anser_time;
            var list = `**[ 규칙 ]**
    **1.** 명령어는 \` ;음악퀴즈 명령어 \` 로 확인하실수 있습니다.
    **2.** 정답은 채팅창에 그냥 입력하시면 됩니다.
    **3.** 정답을 맞추고 몇초뒤에 다음곡으로 넘어갈지 설정할수 있습니다. (기본 : 10초)
    (__;음악퀴즈 설정 명령어__ 를 참고해주세요.)
    **4.** 정답은 __;음악퀴즈 설정 정답__ 으로 설정하실수 있습니다. (기본 : 제목)
    **5.** 노래가 끝나도 정답을 맞추지 못할시 자동으로 스킵됩니다.
    (제목 및 가수는 오피셜(멜론) 명칭을 사용했습니다.)
    (가수는 무조건 한글로 적어주세요.)
    (띄어쓰기나 특수문자 ' 를 유의하여 적어주세요.)
    **6.** 음악퀴즈로 나왔던 곡들은 __;음악퀴즈 초기화__ 를
         하기전까지 다시 나오지 않습니다.
    **7.** 오류나 수정사항은 hky4258@naver.com 으로 보내주세요.

    음악퀴즈 도중 봇이 멈추거나 오류가 생겼다면
    음악퀴즈를 종료하고 다시 시작해주세요. (;음악퀴즈 종료)

    음성 채널에 참여한 후 \` 시작 \`을 입력해 음악퀴즈를 시작하세요.`;
            var np = new MessageEmbed()
                .setTitle(`**현재 음악퀴즈가 시작되지 않았습니다.**`)
                .setDescription(`\` ;음악퀴즈 설정 \`\n정답형식 : ${anser}\n다음곡시간 : ${time}초`)
                .setImage(`https://cdn.hydra.bot/hydra_no_music.png`)
                .setFooter(`기본 명령어 : ;음악퀴즈 명령어`)
                .setColor('ORANGE');
            try {
                try {
                    message.guild.channels.cache.get(data.voicechannelid).leave();
                } catch(err) {}
                try {
                    client.channels.cache.get(data.voicechannelid).leave();
                } catch(err) {}
                try {
                    var c = client.channels.cache.get(data.channelid);
                    c.messages.fetch(data.listid).then(m => {
                        m.edit(list);
                    });
                    c.messages.fetch(data.npid).then(m => {
                        m.edit(np);
                    });
                } catch(err) {}
            } catch(err) {}
        });
    },
}
