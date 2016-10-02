/* Importing required modules
	fs for file reading (we will use synchronous input)
	tmi for Twitch's API to connect to their IRC chat servers
	request for requesting HTML of pages
	cheerio for parsing HTML
	*/
var fs = require('fs');
var tmi = require('tmi.js');
var request = require('request');
var cheerio = require('cheerio');
var SERVICEURL = "http://www.twitchquotes.com/";
var NUM_CHAR_LIM = 500;

// Edit channel (default is kappapastabot) in .userinfo on third line
var load = fs.readFileSync('.userinfo').toString().split('\r\n');

// Options object needed to use tmi, use information loaded from file
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
	channels: ['#' + load[2]] // Specify only one channel to be in at the moment, can be modified
}

// Create a client object and connect to the server
var client = new tmi.client(options);
client.connect();

// Triggered by receiving any chat message
client.on('chat', function (channel, userstate, message, self) {
	//Don't respond to own messages
	if (self) return;
	
	if(message === '!copypasta'){
		var valid = false;
		(function loop() { // We need recursion to occur that every request follows one another
			if(!valid){
				/* Unfortunately the copypasta pages are not numbered contiguously,
					so a large number (largest of all pages) is chosen. Randomly choose one */
				request(SERVICEURL + "copypastas/" + parseInt(Math.random() * 2100),
					function(error, response, body) {
						if(error){
							console.log("Error: " + error);
							return;
						}
						if(response.statusCode != 404) { // Make sure page exists
							var $ = cheerio.load(body);
							var pasta = $("#quote_content_0").text(); //Copypasta found here
							if(pasta.length <= NUM_CHAR_LIM){ // Twitch limits messages to be 500 characters at most
								console.log("Status Code: " + response.statusCode);
								client.say(channel, pasta);
								valid = true;
							}
						}
						loop();
					});
			}
		}());
	} else if (message.indexOf('!copypasta') == 0 && message.length > 11 && message.charAt(10) == ' '){ // Command copypasta + a streamer to pull from
		message = message.slice(11).toLowerCase();
		var stream;
		switch(message) { // Extracting copypastas from www.twitchquotes.com, choose from top 2 pages of streameres
			case "kripp":
				var page = Math.floor(Math.random() * 57) + 1; // Add page numbers for popular streamers
				stream = 'nl_Kripp?page=' + page;
				break;
			case "reynad":
				var page = Math.floor(Math.random() * 18) + 1;
				stream = 'reynad27?page=' + page;
				break;
			case "imaqtpie":
				var page = Math.floor(Math.random() * 15) + 1;
				stream = 'imaqtpie?page=' + page;
				break;
			case "forsen":
				var page = Math.floor(Math.random() * 9) + 1;
				stream = 'Forsenlol?page=' + page;
				break;
			case "trumpsc":
				var page = Math.floor(Math.random() * 3) + 1;
				stream = 'TrumpSC?page=' + page;
				break;
			case "riotgames":
				var page = Math.floor(Math.random() * 3) + 1;
				stream = 'Riot%20Games?page=' + page;
				break;
			case "trick2g":
				var page = Math.floor(Math.random() * 2) + 1;
				stream = 'Trick2g?page=' + page;
				break;
			case "sneakycastroo":
				stream = 'Sneakycastroo';
				break;
			case "strifeCro":
				stream = 'StrifeCro';
				break;
			case "tidesoftime":
				stream = 'Tidesoftime';
				break;
			case "dyrus":
				stream = 'TSM_Dyrus';
				break;
			case "tyler1":
				stream = 'loltyler1';
				break;
			case "sing_sing":
				stream = 'Sing_sing';
				break;
			case "dotamajor":
				stream = 'DotaMajor';
				break;
			case "etrnlwait":
				stream = 'EtrnlWait';
				break;
			case "anniebot":
				stream = 'AnnieBot';
				break;
			case "reckful":
				stream = 'Reckful';
				break;
			case "esltv":
				stream = 'esltv_lol';
				break;
			case "bjergsen":
				stream = 'TSM_Bjergsen';
				break;
			case "kaceytron":
				stream = 'kaceytron';
				break;
			case "wildturtle":
				stream = 'TSM_Wildturtle';
				break;
			case "hafu":
				stream = 'itsHafu';
				break;
			case "hearthstone":
				stream = 'PlayHearthstone';
				break;
			case "tempostorm":
				stream = 'Tempo_Storm';
				break;
			case "kolento":
				stream = 'Kolento';
				break;
			case "theoddone":
				stream = 'TSM_TheOddOne';
				break;
			default: // Streamer not found
				client.say(channel, "Enter [!copypasta streamer] without the brackets. Valid streams: Kripp, Reynad, imaqtpie, Forsen, TrumpSC, RiotGames, Trick2g, Sneakycastroo, StrifeCro, Tidesoftime, Dyrus, Tyler1, Sing_sing, DotaMajor, EtrnlWait, AnnieBot, Reckful, esltv, Bjergsen, kaceytron, WildTurtle, Hafu, Hearthstone, TempoStorm, Kolento, TheOddOne");
				return;
		}

		var pasta_list = [];

	    request(SERVICEURL + "streams/" + stream, function(error, response, body) {
			if(error) {
				console.log("Error: " + error);
				return;
			}
			console.log("Status code: " + response.statusCode);

			var $ = cheerio.load(body);
			$('div.quote_text_area').each(function() {
				var title = $(this).find('span').text();
				// Copypastas with profanity are censored and replaced with 'Quote has been hidden due to profanity', don't include those
				// Avoid spam by conforming to Twitch's 500 character limit
				if(title.indexOf('profanity') == -1 && title.length <= NUM_CHAR_LIM) {
					pasta_list.push(title);
				}
			});

			if (pasta_list.length > 0) {
				var pasta = pasta_list[Math.floor(Math.random() * pasta_list.length)];
				client.say(channel, pasta);
			}
	    });
	}
});

// When the sever pings us, we need to respond with PONG to avoid being disconnected
client.on('ping', function(){
	client.raw('PONG :tmi.twitch.tv');
});

/*
Deprecated Function

function streamPasta(stream) {
	console.log('hello');
    var pasta_list = [];

    var pasta;
    request("http://www.twitchquotes.com/streams/" + stream, function(error, response, body) {
      if(error) {
        console.log("Error: " + error);
      }
      console.log("Status code: " + response.statusCode);

      var $ = cheerio.load(body);

      $('div.quote_text_area').each(function() {
        var title = $(this).find('span').text();
        pasta_list.push(title);
      });

      client.say(pasta_list[Math.floor(Math.random() * pasta.length)]);
    });
    console.log(pasta);
    return pasta;
} */
