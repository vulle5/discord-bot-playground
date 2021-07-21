import dotenv from 'dotenv'
import { Collection } from 'discord.js'
import fse from 'fs-extra'

import client from './client.js'
import { hasCooldownTimeLeft, ignorableMessage, parseCommand } from './utils.js'

dotenv.config();
client.commands = new Collection();
client.cooldowns = new Collection();

const commandFiles = fse.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  import(`./commands/${file}`)
    .then(({ default: command }) => {
      // set a new item in the Collection
      // with the key as the command name and the value as the exported module
      if (command) client.commands.set(command.name, command);
    })
}

client.once('ready', () => {
  console.log('Ready')
})

client.on('message', message => {
  if (ignorableMessage(message)) return;

  const [commandName, args] = parseCommand(message);

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName)

  // Check if args are required for the command
  // Set args: true option in the command file
  if (command.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
  }

  // Check if command is meant to be executed withing guilds text channel
  // Set guildOnly: true option in the command file
  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply('I can\'t execute that command inside a DM!');
  }

  // Check if cooldown has expired
  if (command.cooldown) {
    const timeLeft = hasCooldownTimeLeft(command, message);
    if (timeLeft) {
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s)
        before reusing the \`${command.name}\` command.`
      );
    }
  }

	try {
    command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
})

client.login(process.env.CLIENT_TOKEN)
