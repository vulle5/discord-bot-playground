import { Collection } from 'discord.js'

import client from './client.js'
import config from './config.js'

export const ignorableMessage = message =>
  !message.content.startsWith(config.prefix) || message.author.bot

export const parseCommand = message => {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase();

  return [command, args]
}

export const hasCooldownTimeLeft = (command, message) => {
  const { cooldowns } = client;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      return (expirationTime - now) / 1000;
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  return null;
}
