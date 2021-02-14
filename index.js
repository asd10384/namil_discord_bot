
const Discord = require('discord.js');
const client = new Discord.Client();
const { token, default_prefix, msg_time, help_time, textchannel, mongourl } = require('./config.json');
const { readdirSync } = require('fs');
const { join } = require('path');
const config = require('./config.json');
const db = require('quick.db');

const { dbset } = require('./modules/functions');
const { connect } = require('mongoose');
var dburl = mongourl;
connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Data = require('./modules/data.js');

client.config = config;
client.commands = new Discord.Collection();
client.queue = new Map();

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(join(__dirname, 'commands', `${file}`));
    client.commands.set(command.name, command);
}

client.on('error', console.error);

client.on('ready', async () => {
    var db_text = '';
    try {
        var db_key_list = Object.keys(db.all()[0]['data']);
        for (i=0; i<db_key_list.length; i++) {
            db_text += `\n       \`${i+1}. ${db_key_list[i]} \``;
            for (j=0; j<Object.keys(db.all()[0]['data'][db_key_list[i]]).length; j++) {
                var db_user_id = Object.keys(db.all()[0]['data'][db_key_list[i]])[j];
                db_text += `\n       ${db_user_id}　:　`;
                db_text += `${Object.values(db.all()[0]['data'][db_key_list[i]])[j]}\n`;
            }
        }
    } catch(err) {
        db_text = '\n       없음\n';
    }
    console.log(`

        =========================
          이름 : ${client.user.username}
        
          태그 : ${client.user.tag}
        ==========================

    `);
    console.log('       ====================');
    console.log(db_text);
    console.log('       ====================\n');

    client.user.setPresence({
        activity: {
            name: `${default_prefix}help`,
            type: 'WATCHING'
        },
        status: 'online'
    });
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
            if (!(textchannel['stock'].includes(message.channel.id))) {
                msgdelete(20);
            }
        } catch(error) {
            msgdelete(20);
            const embed = new Discord.MessageEmbed()
                .setColor('DARK_RED')
                .setDescription(`\` ${commandName} \` 이라는 명령어를 찾을수 없습니다.`)
                .setFooter(` ${prefix}help 를 입력해 명령어를 확인해 주세요.`);
            message.channel.send(embed).then(m => {
                setTimeout(function() {
                    m.delete();
                }, msg_time);
            });
        }
    } else if (textchannel['tts'].includes(message.channel.id)) {
        try {
            var args = message.content.trim().split(/ +/g);
        } catch(error) {
            var args = message.content.trim().split(/ +/g);
        }
        const command = client.commands.get('tts');
        command.run(client, message, args);
    } else if (message.channel.id === db.get('db.music.channel')) {
        try {
            var args = message.content.trim().split(/ +/g);
        } catch(error) {
            var args = message.content.trim().split(/ +/g);
        }
        msgdelete(30);
        if (db.get('db.music.start') === 'o') {
            const command = client.commands.get('musicanser');
            command.run(client, message, args);
        } else {
            const command = client.commands.get('musicquiz');
            command.run(client, message, args);
        }
    }
    
    function msgdelete(time) {
        setTimeout(function() {
            message.delete();
        }, time);
    }
});

// process.env.token
client.login(process.env.token);
//client.login('testNzk2OTIyNjEwMTUwNjcwMzc2.X_e-BA.ebnnX0csj-WA_eKsgw-OUO2vCqU');
