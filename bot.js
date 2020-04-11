
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
	return Math.floor(Math.random() * (mx - min + 1) ) + min;
}

function sendRolls(args, msg, mx, num, mod) {
	console.log("in: args: ["+ args.toString() +"], max: "+ mx +", num: "+ num +", mod: "+ mod);
	let response = 'Your die roll is ';
	let rolls = [];
	let sum = 0;
	let adv = 0;
	let finalNum = 0;

	if (args.length >= 2 && args[1] == 'adv')
		adv = 1;
	else if (args.length >= 2 && args[1] == 'disadv')
		adv = -1;
	if (adv != 0 && num == 1)
		num = 2;
	
	for (let i = 0; i < num; i++) {
		let roll = getRandInt(1, mx);
		rolls.push(roll);
		sum += roll;
	}
	if (num > 1)
		response += "["+ rolls.toString() +"] ==> ";
	
	
	if (adv == 1)
		finalNum = Math.max(...rolls);
	else if (adv == -1)
		finalNum = (Math.min(...rolls));
	else
		finalNum = sum;

	if (mod != 0)
		response += finalNum +" + "+ mod +" = ";
	finalNum += mod;
	response += finalNum;

	msg.channel.send(response);
}

function displayHelpMessage(msg) {
	let base = 'all commands must be put after an \'!\', like \'!mayhelp\'';
	let help = '!mayhelp - use this command to display this help message';
	let mc = '!mcserver - use this command to get the address of the May House Minecraft server';
	let inv = '!invite - use this command to get the permanent invitation URL so more people can join the server';
	let pog = '!pog drops a :PogChamp: in chat';
	let dice1 = '![number of dice]d[die type] [adv|disadv] - use this command to simulate die rolls, for example';
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
	console.log("numRolls: "+ numRolls);
	if (isNaN(numRolls) || numRolls > 100)
		return;
	
	let modplus = cmd.indexOf('+');
	let modminus = cmd.indexOf('-');
	let modIdx = (modplus == -1) ? modminus : modplus;
	modIdx = (modIdx == -1) ? cmd.length : modIdx;
	let die = parseInt(cmd.substring(d+1, modIdx));
	if (isNaN(die))
		return;

	let mod = 0;
	if (modIdx != cmd.length) {
		mod = parseInt(cmd.substring(modIdx));
		if (modplus == -1)
			mod = -mod;
	}


	console.log("modplus: "+ modplus +", modminus: "+ modminus +", modIdx: "+ modIdx +", mod: "+ mod);
	let validDice = [100, 20, 12, 10, 8, 6, 4];
	if (validDice.includes(die))
		sendRolls(args, msg, die, numRolls, mod);
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
