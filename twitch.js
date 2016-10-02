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

/* Must provide file named .userinfo with:
	Twitch username on first line,
	oauth token only on second line,
	and channel (no #) to watch on third line */
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
	//if (self) return;
<<<<<<< HEAD
	
	if(message === '!copypasta'){
		var valid = false;
		(function loop() { // We need recursion to occur that every request follows one another
			if(!valid){
				/* Unfortunately the copypasta pages are not numbered contiguously,
					so a large number (largest of all pages) is chosen. Randomly choose one */
				request("http://www.twitchquotes.com/copypastas/" + parseInt(Math.random() * 2100),
					function(error, response, body) {
						console.log(response.statusCode);
						if(response.statusCode != 404) { // Make sure page exists
							var $ = cheerio.load(body);
							var copypasta = $("#quote_content_0").text(); //Copypasta found here
							if(copypasta.length <= 500){ // Twitch limits messages to be 500 characters at most
								client.say(channel, copypasta);
								valid = true;
							}
						}
						loop();
					});
			}
		}());
	} else if (message.indexOf('!copypasta') == 0 && message.length > 11 && message.charAt(10) == ' '){
		message = message.slice(11).toLowerCase();
		console.log(message);
		var stream;
		switch(message) {
			case "kripp":
				var page = Math.floor(Math.random() * 57) + 1;
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
			default:
				client.say(channel, "Not a valid streamer. Enter [!copypasta streamer] without the brackets. Valid streams: Kripp, Reynad, imaqtpie, Forsen, TrumpSC, RiotGames, Trick2g, Sneakycastroo, StrifeCro, Tidesoftime, Dyrus, Tyler1, Sing_sing, DotaMajor, EtrnlWait, AnnieBot, Reckful, esltv, Bjergsen, kaceytron, WildTurtle, Hafu, Hearthstone, TempoStorm, Kolento, TheOddOne");
				return;
		}

		var pasta_list = [];

	    request("http://www.twitchquotes.com/streams/" + stream, function(error, response, body) {
	      if(error) {
	        console.log("Error: " + error);
	      }
	      console.log("Status code: " + response.statusCode);

	      var $ = cheerio.load(body);

	      $('div.quote_text_area').each(function() {
	        var title = $(this).find('span').text();
	        if(title.indexOf('profanity') == -1 && title.length < 500) {
	        	pasta_list.push(title);
	    	}
	      });

	      if (pasta_list.length > 0) {
	      	client.say(channel, pasta_list[Math.floor(Math.random() * pasta_list.length)]);
	  	  }
	    });
	}
});

client.on('ping', function(){
	client.raw('PONG :tmi.twitch.tv');
});

/*function streamPasta(stream) {
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
