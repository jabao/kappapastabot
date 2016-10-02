var irc = require('irc');
var tmi = require('tmi.js');

var options = {
	options: {
		debug: true
	},
	connection: {
		cluster: 'aws',
		reconnect: true
	},
	identity: {
		username: 'creature__bot',
		password: 'oauth:k6t2tuebww41k1s5ecvsyhagleifp9'
	},
	channels: ['#asmodaitv']
}

var client = new tmi.client(options);
client.connect();

client.on("chat", function (channel, userstate, message, self) {
	if (self) return;
	if(message.length > 1 && message.charAt(0) === '!'){
		client.action('#asmodaitv', 'Hello World');
	}
});

/*
client.on('connected', function(address, port) {
	console.log("Address: " + address + " Port: " + port);
});*/
/*
var prompt = require('prompt');
prompt.start();
prompt.get(['username', 'password', 'stream_name'], function(err, results){
	var channel = '#' + results.stream_name;
	console.log('Connecting to Twitch IRC channel ' + channel);
	var client = new irc.Client('irc-ws.chat.twitch.tv', 'creature__bot', {
		channels: [channel],
	});
	client.join(channel + ' oath:oauth:k6t2tuebww41k1s5ecvsyhagleifp9');
});*/
