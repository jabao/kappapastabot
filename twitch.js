var fs = require('fs');
var tmi = require('tmi.js');
var request = require('request');
var cheerio = require('cheerio');

/* Must provide file named .userinfo with:
	Twitch username on first line,
	oauth token only on second line,
	and channel (no #) to watch on third line */
var load = fs.readFileSync('.userinfo').toString().split('\r\n');

var options = {
	options: {
		debug: true
	},
	connection: {
		cluster: 'aws',
		reconnect: true
	},
	identity: {
		username: load[0],
		password: 'oauth:' + load[1]
	},
	channels: ['#' + load[2]]
}

var client = new tmi.client(options);
client.connect();

client.on('chat', function (channel, userstate, message, self) {
	//if (self) return;
	if(message.indexOf('!copypasta') == 0){
		/*var comlen = '!copypasta'.length;
		var second_space = message.indexOf(' ', comlen + 2)
		if(message.length > '!copypasta'.length && message[comlen + 1] == ' '
			&& second_space != -1){
			var subcom = message.slice(comlen + 2, second_space);
			client.say(channel, 'Executing subcommand ' + subcom + '...');
		}
		
		request({
			uri: "http://www.twitchquotes.com/copypastas/1656",
		}, function(error, response, body) {
			var $ = cheerio.load(body);
			client.say(channel, $("#quote_content_0").text());
		});
		client.say(channel, 'Generating random copypasta');*/
	}/* TODO 
		else if(message.indexOf('!animal') == 0){
		request({
			uri: "http://www.thefactsite.com/2010/09/300-random-animal-facts.html",
		}, function(error, response, body) {
			var $ = cheerio.load(body);
			var tot = [];
			var list = $(".post-content > ol").each(function() {
				tot.push($(this).text());
			});
			console.log(tot.length);
		});
	}*/
});

client.on('ping', function(){
	client.raw('PONG :tmi.twitch.tv');
});