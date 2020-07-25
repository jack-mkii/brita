const flag = {
	color: 0x8604c7,
	title: '',
	url: 'https://discord.js.org',
	timestamp: new Date(),
};

const help = {
	color: 0x0099ff,
	title: 'Brita Help',
	url: 'https://discord.js.org',
	// author: {
	// 	name: 'Some name',
	// 	icon_url: 'https://i.imgur.com/wSTFkRM.png',
	// 	url: 'https://discord.js.org',
	// },
	// description: 'description',
	fields: [
		{
			name: 'Welcome to Brita! To configure your Brita bot, use:',
			value: '> @Brita \<command\> \<arguments\>',
			inline: false,
		},
		{
			name: 'Channel',
			value: 'The `channel` command can be used to change the channel Brita will post to when a prohibited word or phrase is used. Choose a bot or admin channel to reduce spam in your server!\n> @Brita channel \#channel_name\n',
			inline: false,
		},
		{
			name: 'Role',
			value: 'The `role` command can be used to give permission to roles. Permissions allow any user with that role to configure Brita on the current server.\n> @Brita role add \<role_name\>\n> @Brita role remove \<role_name\>\n',
			inline: false,
		},
		{
			name: 'Add',
			value: 'The `add` command can be used to add a word or phrase to the prohibited list\n> @Brita add prohibited\n',
			inline: false,
		},
		{
			name: 'Remove',
			value: 'The `remove` command can be used to remove a word or phrase from the prohibited list\n> @Brita remove prohibited\n',
			inline: false,
		},
		{
			name: 'List',
			value: 'The `list` command can be used to print the currently prohibited words or phrases, as well as the roles that currently have permissions and the configured output channel\n> @Brita list\n',
			inline: false,
		},
	],
	// image: {
	// 	url: 'https://i.imgur.com/wSTFkRM.png',
	// },
	// timestamp: new Date(),
	// footer: {
	// 	text: 'Some footer text here',
	// 	icon_url: 'https://i.imgur.com/wSTFkRM.png',
	// },
};

const command = {
	url: 'https://discord.js.org',
};

const list = {
	color: 0x0099ff,
	title: 'Blacklist',
	url: 'https://discord.js.org',
};

module.exports = Object.freeze({
	FLAG: flag,
	HELP: help,
	COMMAND: command,
	LIST: list,
});
