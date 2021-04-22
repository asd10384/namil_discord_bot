
require('dotenv').config();
const TTS = require('@google-cloud/text-to-speech');
const { writeFile } = require('fs');
const { tts_msg } = require('./tts_msg');
const ttsclient = new TTS.TextToSpeechClient({
    keyFile: 'googlettsapi.json'
});
module.exports = {
    seturl,
    ttsstart,
};

async function seturl(message, channel, map, text, options) {
    const [response] = await ttsclient.synthesizeSpeech({
        input: {text: tts_msg(text)},
        voice: {
            languageCode: 'ko-KR',
            name: 'ko-KR-Standard-A'
        },
        audioConfig: {
            audioEncoding: 'MP3', // 형식
            speakingRate: 0.905, // 속도
            pitch: 0, // 피치
            // sampleRateHertz: 16000, // 헤르츠
            // effectsProfileId: ['medium-bluetooth-speaker-class-device'] // 효과 https://cloud.google.com/text-to-speech/docs/audio-profiles
        },
    });
    options['volume'] = 0.7;

    var fileurl = `tts.wav`;
    writeFile(fileurl, response.audioContent, (err) => {
        ttsstart(message, channel, map, fileurl, options);
    });
}

function ttsstart(message, channel, map, url, options) {
    clearTimeout(map.get(`${message.guild.id}.tts`));
    channel.join().then(connection => {
        const dispatcher = connection.play(url, options);
        dispatcher.on("finish", () => {
            var ttstimer = setTimeout(() => {
                return channel.leave();
            }, 1000 * 60 * 10);
            map.set(`${message.guild.id}.tts`, ttstimer);
        });
    });
}
