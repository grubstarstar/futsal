var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
 
var url = 'mongodb://localhost:27017/futsal';

var db;

var app = express();
app.use(express.static('public'));
app.use(express.static('bower_components'));
app.use(bodyParser.json());


app.get('/table', function(req, res, next) {
	
	// the MongoDB collections
	var match = db.collection('match');
	var team = db.collection('team');

	// fetch the football matches from the database
	match.find({}).toArray(function(err, matches) {

		var matchesByTeam = [];

		// organise the matches by team...
		matches.forEach(function(match) {
			matchesByTeam[match.teamA.toHexString()] = matchesByTeam[match.teamA.toHexString()] || [];
			matchesByTeam[match.teamB.toHexString()] = matchesByTeam[match.teamB.toHexString()] || [];
			matchesByTeam[match.teamA.toHexString()].push(match);
			matchesByTeam[match.teamB.toHexString()].push(match);
		});

		// sort the matches in chronological order for each team. This helps
		// us work the last two games and whether they've moved up or down.
		for(var teamId in matchesByTeam) {
			matchesByTeam[teamId] = _(matchesByTeam[teamId]).sortBy(function(match) {
				return new Date(match.kickOffAt);
			});
		}

		// now fetch the teams out of the database
		team.find({}).toArray(function(err, teams) {

			// this will hold the table stats for each team at the
			// current time, once we've iterated through them fully
			var teamStats = {};
			// this will hold a snapshot of the stats at the game
			// before last. We need this to work out if there has been
			// a change in position since the last game was played.
			var teamStatsAtGameBeforeLast = {};

			// go through the teams and create the stats for each
			teams.forEach(function(team, idx, arr) {

				// things we will reuse in this loop
				var teamId = team._id.toHexString();
				var teamMatches = matchesByTeam[teamId];

				// initilise stats
				teamStats[team.name] = teamStats[team.name] || {};
				teamStats[team.name].played = teamStats[team.name].played || 0;
				teamStats[team.name].won = teamStats[team.name].won || 0;
				teamStats[team.name].lost = teamStats[team.name].lost || 0;
				teamStats[team.name].drawn = teamStats[team.name].drawn || 0;
				teamStats[team.name].goalsFor = teamStats[team.name].goalsFor || 0;
				teamStats[team.name].goalsAgainst = teamStats[team.name].goalsAgainst || 0;
				teamStats[team.name].goalDiff = teamStats[team.name].goalDiff || 0;
				teamStats[team.name].points = teamStats[team.name].points || 0;
				teamStats[team.name].position = teamStats[team.name].position || 0;

				// go through each match the team has played, working out stats for the team as we go
				teamMatches.forEach(function(match, idx, arr) {
					
					var teamKey = (teamId == match.teamA) ? 'teamA' : 'teamB';
					var otherTeamKey = (teamId == match.teamA) ? 'teamB' : 'teamA';

					var goals = {
						teamA: match.teamA_Goals,
						teamB: match.teamB_Goals
					};

					// calculate how many the teams have Played
					teamStats[team.name].played++;

					// calculate the wins / draws / loses
					if( goals[teamKey] == goals[otherTeamKey] ) {
						teamStats[team.name].drawn++;
						teamStats[team.name].points += 1;
					}
					else if( goals[teamKey] > goals[otherTeamKey] )
					{
						teamStats[team.name].won++;
						teamStats[team.name].points += 3;
					}
					else
					{
						teamStats[team.name].lost++;
					}
					
					// calculate the Goal Difference
					teamStats[team.name].goalDiff += goals[teamKey] - goals[otherTeamKey];

					// goals For...
					teamStats[team.name].goalsFor += goals[teamKey];

					// ...and Against
					teamStats[team.name].goalsAgainst += goals[otherTeamKey];

					// when we're about to move on to the stats for the last match, take a
					// snapshot of the state of the teamStats so we can decipher whether
					// they've gone up or down since the game before last.
					if(idx == teamMatches.length - 2) {
						teamStatsAtGameBeforeLast[team.name] = _.clone(teamStats[team.name]);
					}

				});
			});

			// worjk out the rank of the teams now and before the last game
			var teamRankAtGameBeforeLast = {};
			var position = 1;

			_.chain(teamStatsAtGameBeforeLast)
				.keys()
				.sortBy(function(teamName) {
					return -teamStatsAtGameBeforeLast[teamName].points
				})
				.each(function(teamName) {
					teamRankAtGameBeforeLast[teamName] = position++;
				})
				.value();

			var teamRank = {};
			position = 1;

			_.chain(teamStats)
				.keys()
				.sortBy(function(teamName) {
					return -teamStats[teamName].points
				})
				.each(function(teamName) {
					teamRank[teamName] = position++;;
				})
				.value();

			// now we can use the teamStats to calculte new teamStats...

			// calculate the Points and add the team name, then fill in the gaps
			teams.forEach(function(team) {

				teamStats[team.name].name = team.name;
				teamStats[team.name].position = teamRank[team.name];
				
				// add a property showing whether the team has moved up, down or stayed at the smae position since the last game.
				if(teamRank[team.name] < teamRankAtGameBeforeLast[team.name]) {
					teamStats[team.name].moved = 'up';
				} else if(teamRank[team.name] > teamRankAtGameBeforeLast[team.name]) {
					teamStats[team.name].moved = 'down';
				} else {
					teamStats[team.name].moved = 'stay';
				}

			});

			res.end(
				JSON.stringify(
					_.sortBy(teamStats, function(stat) { return -stat.points; }),
					undefined,
					"   "
				)
			);

			next();
		});

	});

});

app.get('/match', function(req, res, next) {
	
	var match = db.collection('match');

	var matchStats = {};
	match.find({}).toArray(function(err, matches) {

		var processed = 0;

		matches.forEach(function(match) {
			matchStats[match._id] = {};

			db.collection('team').findOne({
				_id: match.teamA
			}, function(err, teamA) {


				db.collection('team').findOne(
					{ _id: match.teamB
				}, function(err, teamB) {

					matchStats[match._id] = {
						teamA: teamA.name,
						teamA_Goals: match.teamA_Goals,
						teamB: teamB.name,
						teamB_Goals: match.teamB_Goals,
						fullTime: match.fullTime,
						kickOffAt: match.kickOffAt
					};

					processed++;

					if(processed == matches.length) {
						res.end(JSON.stringify(_.values(matchStats), undefined, "   "));
						next();
					}

				});
			});
		});

	});

});

app.post('/match', function(req, res, next) {

	var data = _(req.body).pick('teamA', 'teamB', 'teamA_Goals', 'teamB_Goals', 'kickOffAt', 'fullTime');
	data.kickOffAt = new Date(data.kickOffAt);
	
	teamsFound = {
		teamA: null,
		teamB: null
	};

	function onGotTeam(AorB, insertedId) {
		teamsFound[AorB] = true;
		data[AorB] = insertedId;
		console.log(teamsFound);
		if(teamsFound.teamA && teamsFound.teamB) {
			db.collection('match').insert(data, function(err, result) {
				console.log('hither');
				if (err) throw err;
				res.end(JSON.stringify(result, null, "   "));
				next();
			});	
		}
	}

	db.collection('team').findOne(
		{ name: data.teamA },
		function(err, doc) {
			if (err) throw err;
			if(doc) {
				onGotTeam('teamA', doc._id);
			} else {
				db.collection('team').insert(
					{ name: data.teamA },
					function(err, doc) {
						onGotTeam('teamA', doc._id);
					}
				);
			}
		}
	);

	db.collection('team').findOne(
		{ name: data.teamB },
		function(err, doc) {
			if (err) throw err;
			if(doc) {
				onGotTeam('teamB', doc._id);
			} else {
				db.collection('team').insert(
					{ name: data.teamB },
					function(err, doc) {
						onGotTeam('teamB', doc._id);
					}
				);
			}
		}
	);

});

app.delete('/match', function(req, res, next) {

});

MongoClient.connect(url, function(err, dbHandle) {

	assert.equal(null, err);
	db = dbHandle;
	console.log("Connected to MongoDB, starting HTTP server...");

	app.listen(3000, function(req, res) {
		console.log('...listening on 3000');
	});

});
