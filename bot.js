
/*
 * BOT INITIALIZATION
 */

require('dotenv').config();

const { Client, Intents } = require('discord.js');
const client = new Client({intents:["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"]});
client.login(process.env.DISCORD_TOKEN);

let texts = require("./text.json");
let help_message = "";
for (let i = 0; i < texts.help_message.length; i++) {
	help_message += texts.help_message[i] + "\n"
}
let dice_help = "";
for (let i = 6; i < texts.help_message.length; i++) {
	dice_help += texts.help_message[i] + "\n"
}



client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setStatus("online");
});


/*
 * BOT FUNCTIONS
 */

function getRandInt(min, mx) {
	return Math.floor(Math.random() * (mx - min + 1)) + min;
}

function executeRolls(return_str, to_sum, die, num, sign, adv, crits) {
	adv_list = [];
	return_str = return_str + '(';

	if (adv != 0 && num == 1)
		num = 2;

	for (let i = 0; i < num; i++) {
		let roll = getRandInt(1, die);
		crits[1]++;
		if (roll === die)
			crits[0]++;

		if (adv == 0) {
			to_sum.push(roll * sign);
			if ((i + 1) < num)
				return_str = `${return_str}${roll} + `;
			else
				return_str = `${return_str}${roll})`;
		} else {
			adv_list.push(roll);
			if ((i + 1) < num)
				return_str = `${return_str}${roll}, `;
			else
				return_str = `${return_str}${roll})`;
		}
	}

	if (adv == 1)
		to_sum.push(Math.max(...adv_list) * sign);
	else if (adv == -1)
		to_sum.push(Math.min(...adv_list) * sign);

	return return_str;
}

function parseDice(args, msg) {
	let return_str = '';
	let to_sum = [];
	let crits = [0, 0];
	let cmd = args[0];
	let mod = 0;
	let sign = 1;
	let cur_expr = '';
	let next_idx = 0;
	let adv = 0;

	if (args.length > 1 && args[1] === "adv")
		adv = 1;
	else if (args.length > 1 && "disadv dadv".indexOf(args[1]) != -1)
		adv = -1;

	for (let curr_idx = 0; curr_idx < cmd.length;) {
		let sign = 1;
		if (cmd.substring(0, 1) === "-")
			curr_idx++;

		next_idx = cmd.substring(curr_idx).search("\\\+|-") + curr_idx;
		if (next_idx > curr_idx && next_idx < cmd.length)
			cur_expr = cmd.substring(curr_idx, next_idx);
		else
			cur_expr = cmd.substring(curr_idx);

		if (cmd.substring(curr_idx - 1, curr_idx) === "-")
			sign = -1;

		if (!isNaN(cur_expr)) {
			mod += parseInt(cur_expr)  * sign;
		} else {
			if (sign < 0)
				return_str = return_str.substring(0, return_str.length - 2) +"- ";
			return_str = parseRoll(return_str, to_sum, cur_expr, sign, adv, crits, msg);
			if (typeof return_str === 'undefined' || to_sum === [])
				return;
		}

		if (next_idx > curr_idx && next_idx < cmd.length)
			curr_idx = next_idx + 1;
		else
			break;

		if (isNaN(cur_expr))
			return_str = return_str + ` + `;
	}

	if (mod < 0)
		return_str = `${return_str.substring(0, return_str.length - 2)}- ${Math.abs(mod)}`;
	else if (mod > 0)
		return_str = `${return_str}${mod}`;

	let sum = mod;

	for (let i = 0; i < to_sum.length; i++)
		sum += to_sum[i];
	if (adv == 0)
		return_str = `${return_str} = ${sum}`;
	else
		return_str = `${return_str} => ${sum}`;

	if (crits[1] === 0)
		return_str = `${return_str} ${texts.dice_phrases[0]}`; // discovered

	msg.reply(return_str);
}

function parseRoll(return_str, to_sum, cmd, sign, adv, crits, msg) {
	let d = cmd.search('d|D');
	if (d == -1) {
		console.log('Error: no die roll');
		return;
	}

	let numRolls = 1;
	if (d != 0)
		numRolls = parseInt(cmd.substring(0, d));
	if (isNaN(numRolls) || numRolls > 100) {
		console.log('Error: invalid number of dice');
		return;
	}

	let die = parseInt(cmd.substring(d+1));
	if (isNaN(die)) {
		console.log('Error: unkown die size');
		return;
	}

	if (die === 420) {
		crits[1]++;
		to_sum.push(69);
		return `${return_str}(69)`; // discovered
	} else if (die === 69) {
		crits[1]++;
		to_sum.push(420);
		return `${return_str}(420)`; // discovered
	} else if (die === 42) {
		crits[1]++;
		return `${return_str}${texts.dice_phrases[1]}`; // discovered
	} else if (die === 80) {
		crits[1]++;
		let line = texts.airplane[Math.floor(Math.random() * texts.airplane.length)];
		return `${return_str}${line}`;
	}

	if (isMayServer(msg)) {
		if (die === 5) {
			return_str = executeRolls(return_str, to_sum, die, numRolls, sign, adv, crits);
			return `${return_str} ${texts.dice_phrases[2]}`; // discovered
		} else if (die === 64) {
			crits[1]++;
			return `${return_str}${texts.dice_phrases[3]}`;
		} else if (die === 106) {
			crits[1]++;
			return `${return_str}${texts.dice_phrases[4]}`;
		}
	}

	return executeRolls(return_str, to_sum, die, numRolls, sign, adv, crits);
}

function sendEmoji(msg, emoji_name) {
	let em = msg.guild.emojis.cache.find(emoji => emoji.name === emoji_name);
	if (!em) {
		msg.reply(`This bot does not have the required emoji.`)
		return;
	}
	msg.reply(`${em}`);
}

function sendMilk(msg) {
	let milk = msg.guild.emojis.cache.find(emoji => emoji.name === "pour");
	if (!milk) {
		msg.reply(`This bot does not have the required emoji.`)
		return;
	}
	msg.reply(`${milk}\n\:bed:`);
}

function displayDiceHelpMessage(msg) {
	msg.reply(dice_help.substring(0, dice_help.length-1));
}

function displayHelpMessage(msg) {
	msg.reply(help_message.substring(0, help_message.length-1));
}


function isMayServer(msg) {
	if (msg.guild == null) {
		return false;
	}

	for (let i = 0; i < texts.may_servers.length; i++) {
		if (texts.may_servers[i] === msg.guild.id) {
			return true;
		}
	}
	return false;
}


/* 
 * BOT COMMAND EVENT HANDLERS
 */


client.on('messageCreate', msg => {
	let args = msg.toString().substring(1).split(' ');
	let msg_str = msg.toString().toLowerCase();

	if (msg_str.substring(0, 1) == '!') {
		let cmd = args[0].toLowerCase();

		if (isMayServer(msg)) {
			switch (cmd) {
				case 'mayinvite':
					msg.reply('The server invite is https://discord.gg/UEXyqP9NsS');
					break;
				case 'nerd':
					if (msg.channel.partial) {
						msg.channel.fetch()
							.then(ch => {
								ch.send('Nerd!!');
							})
							.catch(error => {
								console.log('Something went wrong when fetching the message: ', error);
							});
					} else {
						msg.channel.send('Nerd!!');
					}
					break;
				case 'pog':
					sendEmoji(msg, "PogChamp");
					break;
				case 'nerfpog':
					sendEmoji(msg, "NerfPog");
					break;
				case 'milk':
					sendMilk(msg);
					break;
				case 'mayhelp':
					displayHelpMessage(msg);
					break;
				case '':
					break;
				case 'roll':
				case 'r':
				default:
					parseDice(args, msg);
					break;
			}
		} else {

			switch(cmd) {
				case 'nerd':
					if (msg.channel.partial) {
						msg.channel.fetch()
							.then(ch => {
								ch.send('Nerd!!');
							})
							.catch(error => {
								console.log('Something went wrong when fetching the message: ', error);
							});
					} else {
						msg.channel.send('Nerd!!');
					}
					break;
				case 'help':
					displayDiceHelpMessage(msg);
					break;
				case '':
					break;
				default:
					parseDice(args, msg);
					break;
			}
		}

	} else if (msg_str.substring(0, 2).toLowerCase() === '/r') {
		parseDice(args.splice(1), msg);
	}
});
