
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time } = require('../config.json');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: '급식',
    aliases: ['meal'],
    description: 'meal',
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
                await axios.get(url);
            } catch (error) {
                console.error(error);
            }
        }

        getHTML()
            .then(html => {
                let HTMLList = [];
                const $ = cheerio.load(html.data);
                const bodyList = $('div.liveNum ul').children('li');

                bodyList.each(function(i, elem) {
                    HTMLList[i] = {
                        get: $(this)
                            .find('span.num')
                            .text(),
                        before: $(this)
                            .find('span.before')
                            .text()
                    };
                });
                return HTMLList;
            })
            .then(res => {

                const embed = new MessageEmbed()
                    .setTitle(``)
                    .setURL(``)
                    .setDescription(``)
                    .setAuthor(``, ``)
                    .setThumbnail(``)
                    .setFooter(`출처 : `)
                    .setColor('RANDOM');

                return console.log(res);
            });
    },
};
