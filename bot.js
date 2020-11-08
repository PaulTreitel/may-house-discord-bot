
/* 
 * BOT INITIALIZATION
 */

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(process.env.DISCORD_TOKEN);

let airplane = [
	"No thank you. I take it black, like my men.",
	"Ok give me Hamm on 5 and hold the Mayo.",
	"I am serious...and don't call me Shirley.",
	"There's no reason to become alarmed, and we hope you'll enjoy the rest of your flight. By the way, is there anyone on board who knows how to fly a plane?",
	"Joey, have you ever been in a Turkish prison?",
	"I guess the foot's on the other hand, Kramer.",
	"I picked the wrong week to quit smoking.",
	"I picked the wrong week to quit drinking.",
	"I picked the wrong week to quit amphetamines.",
	"I picked the wrong week to quit sniffing glue."
];
let ninek = ["I'm sory Dave, I'm afraid I can't do that.", "His power level is OVER NINE THOUSAAAAAND"];
let ROLE_REACTIONS_ACTIVE = false;
let TEST_SERVER = "DeShadowWolf's Test Server";
let PROD_SERVER = "May Haus";

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
		ret_str = `${ret_str} and I will pour milk on your bed.`; // discovered
	else if (crits[0] === crits[1] && crits[0] != 0)
		ret_str = `${ret_str} CO-CO-CO-COMBO BREAKER!`; // discovered

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
		let line = ninek[Math.floor(Math.random() * ninek.length)];
		return `${ret_str}${line}`;
	} else if (die === 42) {
		crits[1]++;
		return `${ret_str}Six by nine. Forty two. That's it. That's all there is.`; // discovered
	} else if (die === 80) {
		crits[1]++;
		let line = airplane[Math.floor(Math.random() * airplane.length)];
		return `${ret_str}${line}`;
	} else if (die === 67) {
		ret_str = executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
		return `${ret_str} Arion returns again!`;
	} else if (die === 1453) {
		ret_str = executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
		return `${ret_str} CONSTANTINOPLE WILL RISE AGAIN!`;
	} else if (die === 5) {
		ret_str = executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
		return `${ret_str} Pissboi the Fifth, reporting in.`; // discovered
	} else if (die === 64) {
		crits[1]++;
		return `${ret_str}My name is Pussy Galore.`;
	} else if (die === 106) {
		crits[1]++;
		return `${ret_str}Rest In Peace, Milo Malar`;
	}

	return executeRolls(ret_str, to_sum, die, numRolls, sign, adv, crits);
}

function sendPog(msg) {
	let pog = client.emojis.cache.find(emoji => emoji.name === "PogChamp");
	msg.channel.send(`${pog}`);
}

function sendMilk(msg) {
	let milk = client.emojis.cache.find(emoji => emoji.name === "pour");
	msg.channel.send(`${milk}\n\:bed:`);
}

function displayHelpMessage(msg) {
	let base = 'all commands must be put after an \'!\', like \'!mayhelp\'';
	let help = '!mayhelp - use this command to display this help message';
	let mc = '!mcserver - use this command to get the address of the May House Minecraft server';
	let inv = '!mayinvite - use this command to get the permanent invitation URL so more people can join the server';
	let pog = '!pog drops a :PogChamp: in chat';
	let dice1 = '![number of dice]d[die type]+...+[modifier] [adv|disadv|dadv] - use this command to simulate die rolls, for example';
	let dice2 = '!2d10+2 - rolls 2 10-sided dice and gives you the sum plus 2';
	let dice3 = '!d20 advantage - rolls 2 20-sided dice and gives you the higher number';
	let dice4 = '!4d4+d6 - rolls 4 4-sided dice and a 6-sided die and gives you the sum';
	let dice5 = '(The \'!r d20\' and \'/r d20\' and \'!roll\' syntaxes are also supported)'
	let alldice = dice1 +'\n'+ dice2 +'\n'+ dice3 +'\n'+ dice4 + '\n' + dice5;
	msg.channel.send(base +'\n'+ help +'\n'+ mc +'\n'+ inv +'\n'+ pog +'\n'+ alldice);
}

function emojiToRole(emoji_name, roles_cache) {
	if (emoji_name === "❤️") {
		return roles_cache.find(role => role.name === "the heart");
	}
	return null;
}

/* 
 * BOT COMMAND EVENT HANDLERS
 */

 client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('messageReactionAdd: Something went wrong when fetching the message: ', error);
			return;
		}
	}

	if (reaction.message.content.indexOf("OFFICIAL ROLE REACTIONS") != -1) {
		// User doesn't have roles so we need GuildMember object
		let react_guild = client.guilds.cache.find(guild => (guild.name === TEST_SERVER && !ROLE_REACTIONS_ACTIVE) ||
															(guild.name === PROD_SERVER && ROLE_REACTIONS_ACTIVE));
		let react_user = react_guild.members.cache.find(member => member.id === user.id);
		let react_role = emojiToRole(reaction.emoji.name, react_guild.roles.cache);

		if (react_role) {
			react_user.roles.add(react_role);
			console.log(`${react_role.name} given to ${react_user.displayName}.`);
		}
	}
});

client.on('messageReactionRemove', async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('messageReactionRemove: Something went wrong when fetching the message: ', error);
			return;
		}
	}

	if (reaction.message.content.indexOf("OFFICIAL ROLE REACTIONS") != -1) {
		// User doesn't have roles so we need GuildMember object
		let react_guild = client.guilds.cache.find(guild => (guild.name === TEST_SERVER && !ROLE_REACTIONS_ACTIVE) ||
															(guild.name === PROD_SERVER && ROLE_REACTIONS_ACTIVE));
		let react_user = react_guild.members.cache.find(member => member.id === user.id);
		let react_role = emojiToRole(reaction.emoji.name, react_guild.roles.cache);

		if (react_role) {
			react_user.roles.remove(react_role);
			console.log(`${react_role.name} removed from ${react_user.displayName}.`);
		}
	}
});

client.on('guildMemberAdd', user => {
	try {
		let lounge_channel = user.guild.channels.cache.find(channel => channel.name === 'the-lounge');
		let intro_channel = user.guild.channels.cache.find(channel => channel.name === 'introductions');
		let msg = `Welcome ${user} to the May House Discord. Please introduce yourself and drop your real name in the ${intro_channel} channel`;
		if (!lounge_channel)
			return;
		lounge_channel.send(msg);
	} catch (error) {
		console.error('guildMemberAdd: Something went wrong when fetching the channels: ', error);
	}
});

client.on('message', msg => {
	let args = msg.toString().substring(1).split(' ');
	let msg_str = msg.toString().toLowerCase();

	if (msg_str.substring(0, 1) == '!') {
		let cmd = args[0].toLowerCase();

		switch (cmd) {
			case 'mcserver':
				msg.channel.send('The Minecraft server address is mayhousesits.mc.gg');
				break;
			case 'mayinvite':
				msg.channel.send('The server invite is https://discord.gg/7FuX6mK');
				break;
			case 'nerd':
				msg.channel.send('Nerd!!');
				break;
			case 'pog':
				sendPog(msg);
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
