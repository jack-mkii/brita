var Discord = require('discord.io');
var logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

const BLACKLIST = [
	'kys'
]

// onMessage functions

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    if (message.includes(BLACKLIST) && userID != bot.id) {
        bot.sendMessage({
            to: channelID,
            message: `\`${user}\` posted the following message in ${channelID}: \`\`\`${user} \n${message}\`\`\``
        });
     }
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !add
            case 'add':
            	BLACKLIST.push(args[1])
                bot.sendMessage({
                    to: channelID,
                    message: '${args[1]} added to prohibited words'
                });
            break;
         }
     }
});