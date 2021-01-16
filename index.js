// https://discord.com/api/oauth2/authorize?client_id=781679904303218718&permissions=8&scope=bot

/* 
    discord.js
    fs
    path
    quick.db
    discord-giveaways
    discord.js-pagination
    @discordjs/opus
    node-fetch
*/

const Discord = require('discord.js');
const client = new Discord.Client();

const { token, default_prefix, msg_time, help_time, textchannel } = require('./config.json');

const { readdirSync } = require('fs');
const { join } = require('path');

const config = require('./config.json');
client.config = config;

const db = require('quick.db');

const { GiveawaysManager } = require('discord-giveaways');
client.giveawaysManager = new GiveawaysManager(client, {
    storage: './giveaways.json',
    updateCountdownEvery: 5000,
    default: {
        botsCanWin: false,
        exemptPermissions: [],
        embedColor: '#FF0000',
        reaction: '🎉'
    }
});

client.commands = new Discord.Collection();

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(join(__dirname, 'commands', `${file}`));
    client.commands.set(command.name, command);
}

client.on('error', console.error);

client.on('ready', async () => {
    var db_text = '';
    var db_key_list = Object.keys(db.all()[0]['data']);
    for (i=0; i<db_key_list.length; i++) {
        db_text += `\n\`${i+1}. ${db_key_list[i]} \``;
        for (j=0; j<Object.keys(db.all()[0]['data'][db_key_list[i]]).length; j++) {
            var db_user_id = Object.keys(db.all()[0]['data'][db_key_list[i]])[j];
            db_text += `\n${db_user_id}　:　`;
            db_text += `${Object.values(db.all()[0]['data'][db_key_list[i]])[j]}\n`;
        }
    }
    console.log(`

        =========================
          이름 : ${client.user.username}
        
          태그 : ${client.user.tag}
        ==========================

    `);
    console.log('====================');
    console.log(db_text);
    console.log('====================\n');

    client.user.setPresence({
        activity: {
            name: `${default_prefix}help`,
            type: 'WATCHING'
        },
        status: 'online'
    });
});

let stats = {
    serverID: '<ID>',
    total: '<ID>',
    member: '<ID>',
    bots: '<ID>'
};

client.on('guildMemberAdd', member => {
    if (member.guild.id !== stats.serverID) return;
    client.channels.cache.get(stats.total).setName(`Total Users: ${member.guild.memberCount}`);
    client.channels.cache.get(stats.member).setName(`Members: ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
    client.channels.cache.get(stats.bots).setName(`Bots: ${member.guild.members.cache.filter(m => m.user.bot).size}`);
});

client.on('guildMemberRemove', member => {
    if (member.guild.id !== stats.serverID) return;
    client.channels.cache.get(stats.total).setName(`Total Users: ${member.guild.memberCount}`);
    client.channels.cache.get(stats.member).setName(`Members: ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
    client.channels.cache.get(stats.bots).setName(`Bots: ${member.guild.members.cache.filter(m => m.user.bot).size}`);
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    
    var prefix = await db.get(`db.prefix.${message.member.id}`);
    if (prefix == (null || undefined)) {
        await db.set(`db.prefix.${message.member.id}`, default_prefix);
        prefix = default_prefix;
    }
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        
        const command = client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));


        try {
            command.run(client, message, args);
            msgdelete(20);
        } catch(error) {
            msgdelete(20);
            const embed = new Discord.MessageEmbed()
                .setColor('DARK_RED')
                .setDescription(`\` ${commandName} \` 이라는 명령어를 찾을수 없습니다.`)
                .setFooter(` ${prefix}help 를 입력해 명령어를 확인해 주세요.`);
            return message.channel.send(embed).then(m => {
                setTimeout(function() {
                    m.delete();
                }, msg_time)
            });
        }
    } else if (message.channel.id === textchannel) {
        try {
            var args = message.content.trim().split(/ +/g);
        } catch(error) {
            var args = message.content.trim().split(/ +/g);
        }
        const command = client.commands.get('tts');
        command.run(client, message, args);
    }
    
    function msgdelete(time) {
        setTimeout(function() {
            message.delete();
        }, time)
    }
});
// process.env.token
client.login(process.env.token);
//client.login('testNzk2OTIyNjEwMTUwNjcwMzc2.X_e-BA.ebnnX0csj-WA_eKsgw-OUO2vCqU');
