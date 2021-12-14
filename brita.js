require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const Keyv = require('keyv');
const embeds = require('./embeds.js');
const helpers = require('./helpers.js');
// const commands = require('./commands.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);
var CHANNEL = null;
var BLACKLIST = [];
var ROLES = [];

const keyv = new Keyv(process.env.DB);
keyv.on('error', err => console.error('Keyv connection error:', err));

// Initialise
bot.on('ready', function (evt) {
    console.info('Connected');
    console.info(`Logged in as ${bot.user.tag}!`);

    commandEmbed = helpers.commandEmbed;
    channelSet = helpers.channelSet;
    isCommand = helpers.isCommand;
    populateFlagEmbed = helpers.populateFlagEmbed;
    addImageToHelp = helpers.addImageToHelp;
    formatList = helpers.formatList;
    hasPermission = helpers.hasPermission;
    removeItem = helpers.removeItem;
    sendMessage = helpers.sendMessage;
    invalidCommand = helpers.invalidCommand;
});

// Generic error handling
bot.on('error', console.error);

// onMessage functions
bot.on('message', message => {
    // Our bot needs to know if it will execute a command
    if (
    	CHANNEL &&
    	// ToDo make sure this is only for the correct server BLACKLIST...
    	// Can probably just change line 73 to be `blacklist = ...` with `var blacklist = []` around line 64
    	// and move this logic inside the async onMessage
    	// Test by sending a message in EGT, then using an EGT prohibited word in Face's Place
    	// 
    	// This seems to break if not doing a @Brita command when swapping discords
    	// e.g. send prohibited word in FU after a @Brita command (should work)
    	// then send the same prohibited word in Face's Place (needs to be on the list too)
    	// and this won't work without doing a @Brita command in FP first
    	helpers.includesAny(message.content, BLACKLIST) && 
    	!message.author.bot &&
    	!isCommand(message, bot)
    ) {
    	CHANNEL.send( { embed: populateFlagEmbed(embeds.FLAG, message, bot) });
    }
});


/* 
Make it so only people using the prohibited words are reported to the configured channel
Everything else (e.g. embeds for adding/removing words) can just be posted to the channel the command was sent to?
*/


bot.on('message', async message => {
	// Retrieve configurations
	try {
		var r = await keyv.get(`${message.guild.id}_roles`);
		ROLES = r ? r.split('\n') : [];

		var cname = await keyv.get(`${message.guild.id}_channel`);
		CHANNEL = bot.channels.cache.find(c => c.name == cname);

		var bl = await keyv.get(`${message.guild.id}_blacklist`);
		BLACKLIST = bl ? bl.split('\n') : [];
	} catch (e) {
	  	console.error(e);
	}

	// Not owner/consented role
	if (isCommand(message, bot) && !hasPermission(message, ROLES)) {
		sendMessage(message.channel, 'You don\'t have permission to do that!', false);
		return;
	}

	// Bot commands (add/remove/channel)
	if (isCommand(message, bot)) {
		const args = message.cleanContent.split(' ');
		const command = args[1];
		var params = args.slice(2, args.length + 1).join(' ');
		params = params.replace(/\"/g, '');

		switch(command) {
			case 'help':
				message.channel.send({ embed: addImageToHelp(embeds.HELP, bot) });
            	break;
			case 'channel':
				cname = params.replace('#', '')
				c = message.guild.channels.find(c => c.name == cname);
				if (c) {
					await keyv.set(`${message.guild.id}_channel`, cname);
					sendMessage(c, `Destination channel set to \`${params}\``, true);
				} else {
					sendMessage(message.channel, `Could not find channel \`${params}\``, false);
				}
            	break;
			case 'add':
				// Channel not set
				if (!channelSet(CHANNEL, message)) return;

				// Add
				if (!BLACKLIST.includes(params)) {
					BLACKLIST.push(params);
					await keyv.set(`${message.guild.id}_blacklist`, BLACKLIST.join('\n'));
	                
					// Send message to channel
					sendMessage(CHANNEL, `\`${params}\` added to prohibited words`, true);
	            } else {
	            	sendMessage(CHANNEL, `\`${params}\` is already prohibited!`, false);
	            }
	            break;
            case 'remove':
            	// Channel not set
				if (!channelSet(CHANNEL, message)) return;

				// Remove
            	if (BLACKLIST.includes(params)) {
					removeItem(BLACKLIST, params);
					await keyv.set(`${message.guild.id}_blacklist`, BLACKLIST.join('\n'));
	                
					// Send message to channel
					sendMessage(CHANNEL, `\`${params}\` removed from prohibited words`, true);
	            } else {
	            	sendMessage(CHANNEL, `\`${params}\` is not currently prohibited!`, false);
	            }
	            break;
	        case 'list':
	        	// Channel not set
	        	if (!channelSet(CHANNEL, message)) return;

	        	// Print
	        	CHANNEL.send({ embed: formatList(embeds.LIST, BLACKLIST, CHANNEL, ROLES) });
	        	break;
        	case 'role':
        		// Channel not set
				if (!channelSet(CHANNEL, message)) return;

				// Roles
        		p = params.split(' ');
        		if (p.length < 2) {
        			invalidCommand(message.channel);
        			break;
        		}

        		// Add role
        		if (p[0] == 'add') {
        			role = p[1];
        			var found = message.guild.roles.find(r => r.name === role);

        			if (found) {
        				if (!ROLES.includes(role)) {
	        				ROLES.push(role);
	        				await keyv.set(`${message.guild.id}_roles`, ROLES.join('\n'));

	        				// Send message to channel
	        				sendMessage(CHANNEL, `\`@${role}\` added to permissed roles`, true);
						} else {
							sendMessage(CHANNEL, `\`${role}\` already has permission!`, false);
						}
        			} else {
        				sendMessage(CHANNEL, `Role \`@${role}\` does not exist on this server`, false);
        			}
        		} else if (p[0] == 'remove') {
        			role = p[1];

        			if (ROLES.includes(role)) {
        				removeItem(ROLES, role);
        				await keyv.set(`${message.guild.id}_roles`, ROLES.join('\n'));

        				// Send message to channel
        				sendMessage(CHANNEL, `\`@${role}\` removed from permissed roles`, true);
        			} else {
        				sendMessage(CHANNEL, `\`@${role}\` does not currently have permission`, false);
        			}
        		} else {
        			invalidCommand(CHANNEL);
        		}
        		break;
            default:
            	invalidCommand(message.channel);
            	break;
		}
	}
});
