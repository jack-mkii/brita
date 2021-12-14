const fs = require('fs');
const embeds = require('./embeds.js');

exports.channelSet = function channelSet(channel, message) {
	if (channel == null && !message.author.bot) {
		message.channel.send({ embed: commandEmbed(embeds.COMMAND, 'Destination channel not set. Please use the command `@Brita channel <channel_name>` to set the destination channel', false) });
		return false;
	}
	return true;
}

exports.populateFlagEmbed = function populateFlagEmbed(embed, message, bot) {
	embed.author = {
		name: message.author.username + '#' + message.author.tag.toString().split('#')[1],
		icon_url: message.author.avatarURL,
		url: 'https://discord.js.org',
	}
	embed.description = `Message sent in ${message.channel}`;
	embed.fields = [
		{
			name: 'Content',
			value: message.content,
			inline: false,
		},
		{
			name: 'Date',
			value: message.createdAt,
			inline: false,
		},
	];
	embed.thumbnail = {
		url: bot.user.avatarURL,
	};
	embed.footer = {
		text: bot.user.tag,
		icon_url: bot.user.avatarURL,
	};
	return embed;
}

exports.commandEmbed = function commandEmbed(embed, desc, success) {
	if (success) {
		embed.title = 'Success!';
		embed.color = 0x04cf18;
	} else {
		embed.title = 'Error';
		embed.color = 0xe3002d;
	}
	embed.description = desc;
	return embed;
}

exports.addImageToHelp = function addImageToHelp(embed, bot) {
	embed.thumbnail = {
		url: bot.user.avatarURL,
	};
	return embed;
}

exports.formatList = function formatList(embed, blacklist, channel, roles) {
	var prohibited = '';
	var config = '';
	var permissed = '';

	if (blacklist.length == 0) {
		prohibited = 'No currently prohibited words/phrases!';
	} else {
		blacklist.forEach(b => {
			prohibited += `${b}\n`;
		});
	}

	if (channel) {
		config = `${channel}`;
	} else {
		config = 'No channel currently configured';
	}

	if (roles.length == 0) {
		permissed = 'No roles currently have permission (the guild owner may still use commands)';
	} else {
		roles.forEach(b => {
			permissed += `${b}\n`;
		});
	}

	embed.fields = [
		{
			name: 'Currently blacklisted words/phrases:',
			value: prohibited,
		},
		{
			name: 'Configured output channel:',
			value: config,
		},
		{
			name: 'Roles that currently have permission:',
			value: permissed,
		},
	];
	return embed;
}

exports.includesAny = function includesAny(message, arr) {
	for (i = 0; i < arr.length; i++) {
		var match = `${arr[i]}(s|es)?`;
		var re = new RegExp(match, 'g');
		
		if (re.exec(message)) {
			return true;
		}
	}
	return false;
}

exports.removeItem = function removeItem(list, item) {
	list.forEach((value, i) => {
		if (value == item) {
			list.splice(i, 1)
		}
		return;
	});
}

exports.isCommand = function isCommand(message, bot) {
	var match = '^@Brita [a-zA-Z]*';
	var id_match = '^<@!731082917962579989> [a-zA-Z]*';

	var re = new RegExp(match, 'g');
	var id_re = new RegExp(id_match, 'g');

	if (re.exec(message.cleanContent) || id_re.exec(message.content)) {
		return true;
	}
	return false;
}

exports.hasPermission = function hasPermission(message, roles) {
	if (message.guild.ownerID == message.author.id) {
		return true;
	}

	var found = false

	permissed_roles = []
	message.guild.roles.cache.forEach(role => {
		if (roles.includes(role.name)) {
			permissed_roles.push(role);
		}
	});

	permissed_roles.forEach(role => {
		if (role.members.find(r => r.id == message.author.id)) {
			found = true;
		}
	});
	return found;
}

exports.sendMessage = function sendMessage(channel, text, isSuccess) {
	channel.send({ embed: commandEmbed(embeds.COMMAND, text, isSuccess) });
}

exports.invalidCommand = function invalidCommand(channel) {
	sendMessage(channel, 'Invalid command. Please use `@Brita help` for help.', false);
}
