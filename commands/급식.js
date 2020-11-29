
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
                let url = `http://school.busanedu.net/bsnamil-h/main.do`;
                return await axios.get(url);
            } catch (error) {
                console.error(error);
            }
        }

        getHTML()
            .then(html => {
                let HTMLList = [];
                const $ = cheerio.load(html.data);
                const bodyList = $('div.widgDiv.meal_menu1095 ul').children('li');

                bodyList.each(function(i, elem) {
                    HTMLList[i] = {
                        kcal: $(this)
                            .find('dt.kcal span')
                            .text(),
                        meal: $(this)
                            .find('dd.meal_list')
                            .text()
                    };
                });
                return HTMLList;
            })
            .then(res => {
                let kcal = res[0].kcal.slice(0, -4);
                if (kcal === '') kcal = '없음';
                let meal = res[0].meal;

                const embed = new MessageEmbed()
                    .setTitle(`:meat_on_bone: 남일고 점심 :meat_on_bone:`)
                    .setURL(`http://school.busanedu.net/bsnamil-h/dv/dietView/selectDietCalendarView.do?mi=608017`)
                    .setDescription(`칼로리 : \` ${kcal} \`\n\n\` ${meal} \``)
                    .setAuthor(`남일고`, `http://asq.kr/GTpfIJ4pJTVPAU`, `http://school.busanedu.net/bsnamil-h/main.do`)
                    .setThumbnail(`https://namilsite.netlify.app/images/logo.png`)
                    .setFooter(`출처 : 남일고 홈페이지`)
                    .setColor('RANDOM');

                return message.channel
                    .send(embed)
                    .then(m => msgdelete(m, help_time));
            });
    },
};
