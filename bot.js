
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

function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function sendRolls(args, msg, max, num) {
	let response = 'Your die roll is ';
	if (args.length >= 2) {
		let roll1 = getRandInt(1, max);
		let roll2 = getRandInt(1, max);
		if (args[1] == 'advantage' || args[1] == 'adv') {
			response += '(' + roll1 + ', ' + roll2 + ') ==> ' + Math.max(roll1, roll2);
		} else if (args[1] == 'disadvantage' || args[1] == 'disadv') {
			response += '(' + roll1 + ', ' + roll2 + ') ==> ' + Math.min(roll1, roll2);
		}
	} else {
		let sum = 0;
		if (num > 1)
			response += '(';
		for (let i = 0; i < num; i++) {
			let roll = getRandInt(1, max);
			if (num > 1)
				response += roll + ', ';
			sum += roll;
		}
		if (num > 1)
			response = response.substring(0, response.length -2) + ') ==> ';
		response += sum;
	}
	msg.channel.send(response);
}

function displayHelpMessage(msg) {
	let base = 'all commands must be put after an \'!\', like \'!mayhelp\'';
	let help = '!mayhelp - use this command to display this help message';
	let mc = '!mcserver - use this command to get the address of the May House Minecraft server';
	let inv = '!invite - use this command to get the permanent invitation URL so more people can join the server';
	let pog = '!pog drops a :PogChamp: in chat';
	let dice1 = '![number of dice]d[die type] [advantage|disadvantage] - use this command to simulate die rolls, for example';
	let dice2 = '!2d10 - rolls 2 10-sided dice and gives you the sum';
	let dice3 = '!d20 advantage - rolls 2 20-sided dice and gives you the higher number';
	let alldice = dice1 +'\n'+ dice2 +'\n'+ dice3;
	msg.channel.send(base +'\n'+ help +'\n'+ mc +'\n'+ inv +'\n'+ pog +'\n'+ alldice);
}

function parseDieRolls(args, msg) {
	let cmd = args[0];
	let d = cmd.indexOf('d');
	if (d == -1)
		return;

	let numRolls = 1;
	if (d != 0)
		numRolls = parseInt(cmd.substring(0, d));
	if (isNaN(numRolls) || numRolls > 100)
		return;
	
	let die = parseInt(cmd.substring(d+1));
	if (isNaN(die))
		return;
	let validDice = [100, 20, 12, 10, 8, 6, 4];
	if (validDice.includes(die))
		sendRolls(args, msg, die, numRolls);
}

function sendPog(msg) {
	let pog = client.emojis.cache.find(emoji => emoji.name === "PogChamp");
	msg.channel.send(`${pog}`);
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
			case 'pog':
				sendPog(msg);
				break;
			case 'mayhelp':
				displayHelpMessage(msg);
				break;
			default:
				parseDieRolls(args, msg);
				break;
		}
	}
});
