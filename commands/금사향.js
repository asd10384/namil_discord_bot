
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const { default_prefix, msg_time, help_time, drole } = require('../config.json');

module.exports = {
    name: '금사향',
    aliases: ['sahyang', 'sah_yang'],
    description: '금사향 링크',
    async run (client, message, args) {
        function msgdelete(m, t) {
            setTimeout(function() {
                m.delete();
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
        
        // if (!(message.member.roles.cache.some(r => drole.includes(r.name)))) return message.channel.send(per).then(m => msgdelete(m, msg_time));
        
        const help = new MessageEmbed()
            .setTitle(`명령어`)
            .setDescription(`
                \` 명령어 \`
                ${pp}금사향 공식링크 : 유튜브, 트위치 등등 링크
                ${pp}금사향 비공식링크 : 따로제작한 유튜브 재생목록 링크
            `)
            .setColor('RANDOM');
        const em1 = new MessageEmbed()
            .setThumbnail(`https://yt3.ggpht.com/ytc/AAUvwniJ3hBy7jfHx3focMiA8kqqQFbWtyMSC_nVoTqM_Q=s88-c-k-c0x00ffffff-no-rj`)
            .setTitle(`금사향 관련 링크 (공식)`)
            .setDescription(`
                \` 공식 \`
                유튜브 : http://asq.kr/youtubesahyang

                트위치 : https://www.twitch.tv/sah_yang

                트윕 : https://twip.kr/donate/sah_yang

                트위터 : https://twitter.com/Sah_yang

                인스타 : https://www.instagram.com/sah_yang_
            `)
            .setColor('RANDOM');
        const em2 = new MessageEmbed()
            .setThumbnail()
            .setTitle(`금사향 관련 링크 (비공식)`)
            .setDescription(`
                \` 비공식 \` (유튜브 재생목록)
                노래모음 : http://asq.kr/songlistsahyang

                노래원본 : http://asq.kr/songallsahyang
            `)
            .setColor('RANDOM');
        
        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, msg_time));

        if (args[0] == ('공식', 'real', 'official', 'rhdtlr')) return message.channel.send(em1).then(m => msgdelete(m, msg_time+2000));
    
        if (args[0] == ('비공식', 'unreal', 'informality', 'qlrhdtlr')) return message.channel.send(em2).then(m => msgdelete(m, msg_time+2000));
    
        return message.channel.send(help).then(m => msgdelete(m, msg_time));
    },
};
