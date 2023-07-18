
function produceToUserGame(user,gameName, score, lives, level) {
	sendUpdate({ user: user, 'score': score, 'level': level, 'losses': lives });
}

function produceToUserLosses(user,gameName) {
	var topic = "USER_LOSSES"
	var ksqlQuery =`INSERT INTO ${topic} (USER_KEY) VALUES ( STRUCT(USER:='${user}', GAME_NAME:='${gameName}') );`

	const request = new XMLHttpRequest();
	sendksqlDBStmt(request, ksqlQuery);

}

let rest = new Ably.Rest({ key: 'API_KEY' });
let channel = rest.channels.get('game-events');


function loadHighestScore(gameName, user, callback ) {
	channel.history((err, page) => {
		if (err) {
			console.log('Unable to get history');
			return;
		}
		var highestScore = 0;
		// TODO: Get highest score for user
		callback(highestScore);
	});
}

function getScoreboardJson(gameName, callback) {
	channel.history((err, page) => {
		if (err) {
			console.log('Unable to get history');
			return;
		}
		var scoreboard = [];
		page.items.forEach((message) => {
			scoreboard.push(message.data);
		});
		console.log(scoreboard[0]);
		scoreboard = scoreboard.sort(function(a, b) {
			return  parseInt(b.score) - parseInt(a.score);
		});
		let namesThatHavePlayed = [];

		scoreboard = scoreboard.filter(function(item){
			if(namesThatHavePlayed.includes(item.user)){
				return false;
			}
			namesThatHavePlayed.push(item.user);
			return true;
		});

		callback(scoreboard);
	});
}

function sendUpdate(data){
	console.log(data);
	channel.publish('data', data);
}


