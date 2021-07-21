export default {
	name: 'test',
	description: 'Test!',
	execute(message, args) {
		message.channel.send('Pong!');
	}
}
