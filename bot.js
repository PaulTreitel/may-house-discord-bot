
/* 
 * BOT INITIALIZATION
 */

// Run dotenv
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setStatus("online");
});

client.login(process.env.DISCORD_TOKEN);

/* 
 * BOT FUNCTIONS
 */

function getRandInt(min, mx) {
	return Math.floor(Math.random() * (mx - min + 1)) + min;
}

function executeRolls(ret_str, to_sum, die, num, sign, adv) {
	adv_list = [];
	ret_str = ret_str + '(';

	if (adv != 0 && num == 1)
		num = 2;

	for (let i = 0; i < num; i++) {
		let roll = getRandInt(1, die);

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
	let cmd = args[0];
	let d = cmd.indexOf('d');
	let mod = 0;
	let sign = 1;
	let cur_expr = '';
	let iter = 0;
	let next_idx = 0;
	let adv = 0;

	if (args.length > 1 && args[1] === "adv")
		adv = 1;
	else if (args.length > 1 && "disadv dadv".indexOf(args[1]) != -1)
		adv = -1;

	for (let curr_idx = 0; curr_idx < cmd.length; iter++) {
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
			ret_str = parseRoll(ret_str, to_sum, cur_expr, sign, adv);
		}

		if (next_idx > curr_idx && next_idx < cmd.length)
			curr_idx = next_idx + 1;
		else
			break;

		if (isNaN(cur_expr))
			ret_str = ret_str + ` + `;

		if (iter > 10)
			break;
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

	msg.channel.send(ret_str);
}

function parseRoll(ret_str, to_sum, cmd, sign, adv) {
	let d = cmd.indexOf('d');
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

	let validDice = [100, 20, 12, 10, 8, 6, 4];
	if (validDice.includes(die)) {
		return executeRolls(ret_str, to_sum, die, numRolls, sign, adv);
	}
}

function sendPog(msg) {
	let pog = client.emojis.cache.find(emoji => emoji.name === "PogChamp");
	msg.channel.send(`${pog}`);
}

function displayHelpMessage(msg) {
	let base = 'all commands must be put after an \'!\', like \'!mayhelp\'';
	let help = '!mayhelp - use this command to display this help message';
	let mc = '!mcserver - use this command to get the address of the May House Minecraft server';
	let inv = '!invite - use this command to get the permanent invitation URL so more people can join the server';
	let pog = '!pog drops a :PogChamp: in chat';
	let dice1 = '![number of dice]d[die type]+...+[modifier] [adv|disadv|dadv] - use this command to simulate die rolls, for example';
	let dice2 = '!2d10+2 - rolls 2 10-sided dice and gives you the sum plus 2';
	let dice3 = '!d20 advantage - rolls 2 20-sided dice and gives you the higher number';
	let dice4 = '!4d4+d6 - rolls 4 4-sided dice and a 6-sided die and gives you the sum';
	let alldice = dice1 +'\n'+ dice2 +'\n'+ dice3 +'\n'+ dice4;
	msg.channel.send(base +'\n'+ help +'\n'+ mc +'\n'+ inv +'\n'+ pog +'\n'+ alldice);
}

/* 
 * BOT COMMAND EVENT HANDLERS
 */

client.on('guildMemberAdd', user => {
	let lounge_channel = user.guild.channels.cache.find(channel => channel.name === 'the-lounge');
	let name_key_channel = user.guild.channels.cache.find(channel => channel.name === 'name-key');
	let msg = `Welcome ${user} to the May House Discord. Please drop your real name in the ${name_key_channel} channel`;
	if (!lounge_channel)
		return;
	lounge_channel.send(msg);
});

client.on('message', msg => {
	if (msg.toString().substring(0, 1) == '!') {
		let args = msg.toString().substring(1).split(' ');
		let cmd = args[0];

		switch (cmd) {
			case 'mcserver':
				msg.channel.send('The Minecraft server address is mayhousesits.mc.gg');
				break;
			case 'invite':
				msg.channel.send('The server invite is https://discord.gg/7FuX6mK');
				break;
			case 'Nerd':
			case 'NERD':
			case 'nerd':
				msg.channel.send('Nerd!!');
				break;
			case 'pog':
				sendPog(msg);
				break;
			case 'mayhelp':
				displayHelpMessage(msg);
				break;
			default:
				parseDice(args, msg);
				break;
		}
	}
});
