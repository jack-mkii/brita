require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);
var CHANNEL = null;

bot.on('ready', function (evt) {
    console.info('Connected');
    console.info(`Logged in as ${bot.user.tag}!`);

    // Global variable for channel to post to
    // ToDo remove
    CHANNEL = bot.channels.find('name', 'bot-check');
});

// Initialise blacklist
// ToDO: maintain this per-server, and persist it using keyv (https://discordjs.guide/keyv/#installation)
const blacklist = fs.readFileSync('./resources/blacklist.txt').toString();
var BLACKLIST = blacklist.split('\n');

// Helper functions
function includesAny(message, arr) {
	for (i = 0; i < arr.length; i++) {
		if (message.includes(arr[i])) {
			return true;
		}
	}
	return false;
}

function channelSet(message) {
	if (CHANNEL == null && !message.author.bot) {
		message.channel.send('Destination channel not set. Please use the command `@Brita channel <channel_name>` to set the destination channel');
		return false;
	}
	return true;
}

function rewriteBlacklist() {
	fs.writeFileSync('./resources/blacklist.txt', BLACKLIST.join('\n'), (err) => { 
	    // In case of a error throw err. 
	    if (err) throw err; 
	});
}

function removeItem(list, item) {
	list.forEach((value, i) => {
		if (value == item) {
			list.splice(i, 1)
		}
		return;
	});
}

// onMessage functions
bot.on('message', message => {
    // Our bot needs to know if it will execute a command
    if (CHANNEL && includesAny(message.content, BLACKLIST) && !message.author.bot) {
        CHANNEL.send(
        	`\`${message.author.tag}\` posted the following message in ${message.channel}: \`\`\`${message.author.username} \n${message.cleanContent}\`\`\``
    	);
    }
});

bot.on('message', message => {
	// Not a mod
	if (
		message.content.substring(3, 21) == bot.user.id &&
		!(message.member.roles.find(r => r.name === "Admin") || message.member.roles.find(r => r.name === "Mod"))
	) return;

	// Bot commands (add/remove/channel)
	if (message.content.substring(3, 21) == bot.user.id) {
		const args = message.cleanContent.split(' ');
		const command = args[1];
		var params = args.slice(2, args.length + 1).join(' ');
		params = params.replace(/\"/g, '');

		switch(command) {
			case 'help':
            	message.channel.send('```MD\n< Welcome to Brita! To configure your Brita bot, use: >\n> @Brita \<command\> \<arguments\>\n\n# Add\nThe `add` command can be used to add a word or phrase to the prohibited list\n> @Brita add \"prohibited\"\n> @Brita add prohibited\n\n# Remove\nThe `remove` command can be used to remove a word or phrase from the prohibited list\n> @Brita remove \"prohibited\"\n> @Brita remove prohibited\n\n# Channel\nThe `channel` command can be used to change the channel Brita will post to when a prohibited word or phrase is used. Choose a bot or admin channel to reduce spam in your server!\n> @Brita channel \<\#channel_name\>```')
            	break;
			case 'channel':
				// ToDo: persist this (and do so per-server) using keyv (https://discordjs.guide/keyv/#installation)
				c = message.guild.channels.find('name', params.replace('#', ''));
				if (c) {
					CHANNEL = c;
					CHANNEL.send(`Destination channel set to \`${params}\``);
				} else {
					message.channel.send(`Could not find channel \`${params}\``);
				}
            	break;
			case 'add':
				// Channel not set
				if (!channelSet(message)) return;

				// Add
				if (!BLACKLIST.includes(params)) {
					BLACKLIST.push(params);
					rewriteBlacklist();
	                
					// Send message to channel
	                CHANNEL.send(`\`${params}\` added to prohibited words`);
	            } else {
	            	CHANNEL.send(`\`${params}\` is already prohibited!`);
	            }
	            break;
            case 'remove':
            	// Channel not set
				if (!channelSet(message)) return;

				// Remove
            	if (BLACKLIST.includes(params)) {
					removeItem(BLACKLIST, params);
					rewriteBlacklist();
	                
					// Send message to channel
	                CHANNEL.send(`\`${params}\` removed from prohibited words`);
	            } else {
	            	CHANNEL.send(`\`${params}\` is not currently prohibited!`);
	            }
	            break;
            default:
            	message.channel.send('Invalid command. Please use `@Brita help` for help.');
            	break;
		}
	}
});
