
require('dotenv').config();
const request = require('request');
const cheerio = require('cheerio');

module.exports = {
    seturl,
    ttsstart,
};

async function seturl(message, channel, map, text, options) {
    var url = `https://freetts.com/Home/PlayAudio?Language=ko-KR&Voice=ko-KR-Standard-A&TextMessage=${encodeURI(text)}&id=undefined&type=0`;
    request(url, async (err, response, body) => {
        var mp3 = `https://freetts.com/audio/${eval(`[${body}]`)[0].id}`;
        await ttsstart(message, channel, map, mp3, options);
    });
}

async function ttsstart(message, channel, map, url, options) {
    clearTimeout(map.get(`${message.guild.id}.tts`));
    channel.join().then(connection => {
        const dispatcher = connection.play(url, options);
        dispatcher.on("finish", async () => {
            var ttstimer = setTimeout(async() => {
                return channel.leave();
            }, 1000 * 60 * 10);
            map.set(`${message.guild.id}.tts`, ttstimer);
        });
    });
}
