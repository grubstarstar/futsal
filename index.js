var _ = require('underscore');
var moment = require('moment');

var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
 
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
			// if the match isn't finished, we'll skip it
			if(moment(match.kickOffAt).add(90, 'minutes').isAfter(moment())) {
				return;
			}
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

			// build a lookup of team ID to name
			var teamIdName = {};
			teams.forEach(function(team) {
				teamIdName[team._id] = team.name;
			});

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

				if (!teamMatches) return;

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
				teamStats[team.name].lastFive = teamStats[team.name].lastFive || [];

				// go through each match the team has played, working out stats for the team as we go
				teamMatches.forEach(function(match, idx, arr) {
					
					var teamKey = (teamId == match.teamA) ? 'teamA' : 'teamB';
					var otherTeamKey = (teamId == match.teamA) ? 'teamB' : 'teamA';

					var goals = {
						teamA: parseInt(match.teamA_Goals),
						teamB: parseInt(match.teamB_Goals)
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

					var otherTeamName = teamIdName[match[otherTeamKey]];

					if(idx >= teamMatches.length - 5) {
						teamStats[team.name].lastFive.push({
							goalsFor: goals[teamKey],
							goalsAgainst: goals[otherTeamKey],
							playingAgainst: otherTeamName,
							kickOffAt: match.kickOffAt
						});
					}

				});
			});

			// worjk out the rank of the teams now and before the last game
			var teamRankAtGameBeforeLast = {};
			var position = 1;

			_.chain(teamStatsAtGameBeforeLast)
				.keys()
				.sortBy(function(teamName) {
					return -teamStatsAtGameBeforeLast[teamName].points;
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
					return -teamStats[teamName].points;
				})
				.each(function(teamName) {
					teamRank[teamName] = position++;
				})
				.value();

			// now we can use the teamStats to calculte new teamStats...

			// calculate the Points and add the team name, then fill in the gaps
			teams.forEach(function(team) {

				if (!teamStats[team.name]) return;

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

		if(matches.length === 0) {
			res.end(JSON.stringify([]));
			next();
			return;
		}

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
						id: match._id,
						teamA: teamA.name,
						teamA_Goals: match.teamA_Goals,
						teamB: teamB.name,
						teamB_Goals: match.teamB_Goals,
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

	// validate fields
	var requiredFields = ['teamA', 'teamB', 'kickOffAt'];
	var optionalFields = ['teamA_Goals', 'teamB_Goals'];
	var allFields = requiredFields.concat(optionalFields);

	var missingRequiredFields = [];
	_(requiredFields)
		.each(function(requiredField) {
			if(!req.body[requiredField]) missingRequiredFields.push(requiredField);
		});
	if(missingRequiredFields.length) {
		res
			.status(400)
			.json({
				error: 'Missing required fields: ' + missingRequiredFields.join(', ')
			});
		res.end();
		next();
		return;
	}

	// get the data in the form that we want
	var data = _(req.body).pick.apply(_(req.body), allFields);
	data.kickOffAt = moment(new Date(data.kickOffAt));

	if(!data.kickOffAt.isValid()) {
		res.status(400).json({ error: 'Invalid kickOffAt datetime string' });
		res.end();
		next();
	}

	data.kickOffAt = data.kickOffAt.toJSON();

	// just set to 0 - 0 is there are no goals given. The fixture may not have been played yet.
	// also set FullTime to false, assuming it hasn't been played.
	data.teamA_Goals = data.teamA_Goals || 0;
	data.teamB_Goals = data.teamB_Goals || 0;

	
	var teamsFound = {
		teamA: null,
		teamB: null
	};

	var teamIdToName = {};

	function onGotTeam(AorB, id) {
		teamsFound[AorB] = true;
		data[AorB] = id;
		if(teamsFound.teamA && teamsFound.teamB) {
			db.collection('match').insert(data, function(err, result) {
				if (err) throw err;
				var newMatch = result.ops[0];
				newMatch.id = newMatch._id;
				newMatch.teamA = teamIdToName[newMatch.teamA];
				newMatch.teamB = teamIdToName[newMatch.teamB];
				delete newMatch._id;
				res.end(JSON.stringify(newMatch, null, "   "));
				next();
			});	
		}
	}

	db.collection('team').findOne(
		{ name: data.teamA },
		function(err, doc) {
			if (err) throw err;
			if(doc) {
				teamIdToName[doc._id] = doc.name;
				console.log(teamIdToName);
				onGotTeam('teamA', doc._id);
			} else {
				db.collection('team').insert(
					{ name: data.teamA },
					function(err, r) {
						teamIdToName[r.insertedIds[0]] = data.teamA;
						onGotTeam('teamA', r.insertedIds[0]);
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
				teamIdToName[doc._id] = doc.name;
				console.log(teamIdToName);
				onGotTeam('teamB', doc._id);
			} else {
				db.collection('team').insert(
					{ name: data.teamB },
					function(err, r) {
						teamIdToName[r.insertedIds[0]] = data.teamB;
						onGotTeam('teamB', r.insertedIds[0]);
					}
				);
			}
		}
	);

});

app.put('/match', function(req, res, next) {

	// validate fields
	var requiredFields = ['id', 'teamA_Goals', 'teamB_Goals'];
	var allFields = requiredFields;

	console.log(req.body);

	var missingRequiredFields = [];
	_(requiredFields)
		.each(function(requiredField) {
			if(!req.body[requiredField]) missingRequiredFields.push(requiredField);
		});
	if(missingRequiredFields.length) {
		res
			.status(400)
			.json({
				error: 'Missing required fields: ' + missingRequiredFields.join(', ')
			});
		res.end();
		next();
		return;
	}

	// get the data in the form that we want
	var data = _(req.body).pick.apply(_(req.body), allFields);
	
	db.collection('match').updateOne(
		{ _id: ObjectID.createFromHexString(data.id) },
		{ $set: _(data).pick('teamA_Goals', 'teamB_Goals') },
		function(err, r) {
			if(err) throw err;
			db.collection('match').findOne({
				_id: ObjectID.createFromHexString(data.id)
			}, function(err, match) {
				match.id = match._id;
				delete match._id;
				res.end(JSON.stringify(match));
				next();
			});
		}
	);
});

app.delete('/match/:id', function(req, res, next) {
	
	if(!req.params.id) {
		res
			.status(400)
			.json({
				error: 'Missing required fields: id'
			});
		res.end();
		next();
		return;
	}

	// get the match first so we're able to send back
	// the document we're deleting in the response
	db.collection('match').findOne({
		_id: ObjectID.createFromHexString(req.params.id)
	}, function(err, match) {
		match.id = match._id;
		delete match._id;
		// now delete it from the db and send the response
		db.collection('match').removeOne(
			{ _id: ObjectID.createFromHexString(req.params.id) },
			function(err, r) {
				if(err) throw err;
				res.end(JSON.stringify(match));
				next();
			}
		);
	});
	
});

MongoClient.connect(url, function(err, dbHandle) {

	assert.equal(null, err);
	db = dbHandle;
	console.log("Connected to MongoDB, starting HTTP server...");

	app.listen(8080, function(req, res) {
		console.log('...listening on 8080');
	});

});
