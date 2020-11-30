
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'covid',
    aliases: ['코로나'],
    description: '국내 코로나 확인',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
            }, t)
        }
        var pp = db.get(`prefix_${message.guild.id}`);
        if (pp === null) pp = default_prefix;

        async function getHTML() {
            try {
                let url = `http://ncov.mohw.go.kr`;
                return await axios.get(url);
            } catch (error) {
                console.error(error);
            }
        }

        getHTML()
            .then(html => {
                let HTMLList = [];
                let HTMLList2 = [];
                const $ = cheerio.load(html.data);
                const bodyList = $('div.datalist ul').children('li');
                const bodyList2 = $('div.liveNum ul').children('li');

                bodyList.each(function(i, elem) {
                    HTMLList[i] = {
                        get: $(this)
                            .find('span.subtit')
                            .text(),
                        before: $(this)
                            .find('span.data')
                            .text()
                    };
                });
                bodyList2.each(function(i, elem) {
                    HTMLList2[i] = {
                        get: $(this)
                            .find('span.num')
                            .text(),
                        before: $(this)
                            .find('span.before')
                            .text()
                    };
                });
                let res = HTMLList.concat(HTMLList2);
                return res;
            })
            .then(res => {
                const embed = new MessageEmbed()
                    .setTitle(`:x: 국내 코로나 확인 :x:`)
                    .setURL(`http://ncov.mohw.go.kr/`)
                    .setDescription(`
                        \`일일확진자\`
                        ${res[0].get} : ${res[0].before}
                        ${res[1].get} : ${res[1].before}
                        
                        \`확진환자\`
                        ${res[2].get}
                        ${res[2].before}
                        
                        \`사망자\`
                        ${res[5].get}
                        ${res[5].before}
                    `)
                    .setAuthor(`COVID-19`, `http://ncov.mohw.go.kr/static/image/header/homeimg_new.jpg`, `http://ncov.mohw.go.kr/`)
                    .setThumbnail(`http://ncov.mohw.go.kr/static/image/header/homeimg_new.jpg`)
                    .setFooter(`출처 : 코로나바이러스감염증-19(COVID-19)`)
                    .setColor('RANDOM');

                return message.channel.send(embed).then(m => msgdelete(m, help_time));
            });
    },
};
