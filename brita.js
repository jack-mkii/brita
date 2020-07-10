require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', function (evt) {
    console.info('Connected');
    console.info(`Logged in as ${bot.user.tag}!`);
});
