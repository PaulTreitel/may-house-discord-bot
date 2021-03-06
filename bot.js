
/*
 * BOT INITIALIZATION
 */

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.DISCORD_TOKEN);

let texts = require("./text.json");
let help_message = "";
for (let i = 0; i < texts.help_message.length; i++) {
	help_message += texts.help_message[i] + "\n"
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

function executeRolls(ret_str, to_sum, die, num, sign, adv, crits) {
	adv_list = [];
	ret_str = ret_str + '(';

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
				ret_str = `${ret_str}${roll} + `;
			else
				ret_str = `${ret_str}${roll})`;
		} else {
			adv_list.push(roll);
			if ((i + 1) < num)
				ret_str = `${ret_str}${roll}, `;
			else
				ret_str = `${ret_str}${roll})`;
		}
	}

	if (adv == 1)
		to_sum.push(Math.max(...adv_list) * sign);
	else if (adv == -1)
		to_sum.push(Math.min(...adv_list) * sign);

	return ret_str;
}

function parseDice(args, msg) {
	let ret_str = '';
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
				ret_str = ret_str.substring(0, ret_str.length - 2) +"- ";
			ret_str = parseRoll(ret_str, to_sum, cur_expr, sign, adv, crits);
			if (typeof ret_str === 'undefined' || to_sum === [])
				return;
		}

		if (next_idx > curr_idx && next_idx < cmd.length)
			curr_idx = next_idx + 1;
		else
			break;

		if (isNaN(cur_expr))
			ret_str = ret_str + ` + `;
	}

	if (mod < 0)
		ret_str = `${ret_str.substring(0, ret_str.length - 2)}- ${Math.abs(mod)}`;
	else if (mod > 0)
		ret_str = `${ret_str}${mod}`;

	let sum = mod;

	for (let i = 0; i < to_sum.length; i++)
		sum += to_sum[i];
	if (adv == 0)
		ret_str = `${ret_str} = ${sum}`;
	else
		ret_str = `${ret_str} => ${sum}`;

	if (crits[1] === 0)
		ret_str = `${ret_str} ${texts.dice_phrases[0]}`; // discovered

	msg.reply(ret_str);
}

function parseRoll(ret_str, to_sum, cmd, sign, adv, crits) {
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
		return `${ret_str}(69)`; // discovered
	} else if (die === 69) {
		crits[1]++;
		to_sum.push(420);
		return `${ret_str}(420)`; // discovered
	} else if (die === 9000) {
		crits[1]++;
		let line = texts.nine_thousand[Math.floor(Math.random() * texts.nine_thousand.length)];
		return `${ret_str}${line}`;
	} else if (die === 42) {
		crits[1]++;
		return `${ret_str}${texts.dice_phrases[1]}`; // discovered
	} else if (die === 80) {
		crits[1]++;
		let line = texts.airplane[Math.floor(Math.random() * texts.airplane.length)];
		return `${ret_str}${line}`;
	} else if (die === 67) {
		ret_str = executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
		return `${ret_str} ${texts.dice_phrases[2]}`;
	} else if (die === 1453) {
		ret_str = executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
		return `${ret_str} ${texts.dice_phrases[3]}`;
	} else if (die === 5) {
		ret_str = executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
		return `${ret_str} ${texts.dice_phrases[4]}`; // discovered
	} else if (die === 64) {
		crits[1]++;
		return `${ret_str}${texts.dice_phrases[5]}`;
	} else if (die === 106) {
		crits[1]++;
		return `${ret_str}${texts.dice_phrases[6]}`;
	}

	return executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
}

function sendEmoji(msg, emoji_name) {
	let em = client.emojis.cache.find(emoji => emoji.name === emoji_name);
	if (!milk) {
		msg.channel.send(`This bot does not have the required emoji.`)
		return;
	}
	msg.channel.send(`${em}`);
}

function sendMilk(msg) {
	let milk = client.emojis.cache.find(emoji => emoji.name === "pour");
	if (!milk) {
		msg.channel.send(`This bot does not have the required emoji.`)
		return;
	}
	msg.channel.send(`${milk}\n\:bed:`);
}

function displayHelpMessage(msg) {
	msg.channel.send(help_message.substring(0, help_message.length-1));
}


/* 
 * BOT COMMAND EVENT HANDLERS
 */


client.on('message', msg => {
	let args = msg.toString().substring(1).split(' ');
	let msg_str = msg.toString().toLowerCase();

	if (msg_str.substring(0, 1) == '!') {
		let cmd = args[0].toLowerCase();

		switch (cmd) {
			case 'mcserver':
				msg.channel.send('The Minecraft server address is 207.244.79.120:64635');
				break;
			case 'mayinvite':
				msg.channel.send('The server invite is https://discord.gg/7FuX6mK');
				break;
			case 'nerd':
				msg.channel.send('Nerd!!');
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
			case 'roll':
			case 'r':
				parseDice(args.splice(1), msg);
				break;
			case '':
				break;
			default:
				parseDice(args, msg);
				break;
		}

	} else if (msg_str.substring(0, 2) === '/r' || msg_str.substring(0, 2) === '/R') {
		parseDice(args.splice(1), msg);
	}
});
