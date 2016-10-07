"use strict"

var _ = require('lodash');
var moment = require('moment');

var http = require('http');
var https = require('https');
var fs = require('fs');
var crypto = require('crypto');

var fetch = require('isomorphic-fetch')
var querystring = require('querystring')
var handlebars = require('handlebars')

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

// trying our some of that curry stuff
let respond = _.curry((status, json, next, res) => {
	res.status(status).end(JSON.stringify(json))
	next()
})
let forbiddenRespond = respond(401)
let okRespond = respond(200)
let internalServerError = respond(500)

app.use((req, res, next) => {
	console.log(`>> %s %s`, req.method, req.url)
	if(req.body) {
		console.log('   DATA', req.body)
	}
	next()
})

// the endpoints
app.get('/table', function(req, res, next) {

	console.log('in get /table')
	
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
	
	console.log('in get /match')

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
	var requiredFields = ['teamA', 'teamB', 'kickOffAt']
	var optionalFields = ['teamA_Goals', 'teamB_Goals']
	var allFields = requiredFields.concat(optionalFields)

	var missingRequiredFields = requiredFields
		.filter((requiredField) => !req.body[requiredField])
	if(missingRequiredFields.length) {
		res
			.status(400)
			.json({
				error: 'Missing required fields: ' + missingRequiredFields.join(', ')
			});
		res.end()
		next()
		return
	}

	// get the data in the form that we want
	var data = _(req.body).pick.apply(_(req.body), allFields)
	data.kickOffAt = moment(new Date(data.kickOffAt))

	if(!data.kickOffAt.isValid()) {
		res.status(400).json({ error: 'Invalid kickOffAt datetime string' })
		res.end()
		next()
		return
	}

	data.kickOffAt = data.kickOffAt.toJSON()

	// just set to 0 - 0 is there are no goals given. The fixture may not have been played yet.
	// also set FullTime to false, assuming it hasn't been played.
	data.teamA_Goals = data.teamA_Goals || 0
	data.teamB_Goals = data.teamB_Goals || 0

	
	var teamsFound = {
		teamA: null,
		teamB: null
	};

	var teamIdToName = {}

	Promise.all(['teamA', 'teamB'].map((key) => {
		return db.collection('team').findOne(
			{ name: data[key] }
		).then((doc) => {
			return doc
				? doc._id
				: db.collection('team').insert(
					{ name: data[key] }
				).then((r) => r.insertedIds[0])
		}).then((teamId) => {
			console.log(`%s (%s) resolved to %s`, key, data[key], teamId)
			teamIdToName[teamId] = data[key]
			data[key] = teamId
		})
	}))
	.then(() => {
		db.collection('match').insert(data)
			.then((r) => {
				var newMatch = r.ops[0];
				newMatch.id = newMatch._id;
				newMatch.teamA = teamIdToName[newMatch.teamA];
				newMatch.teamB = teamIdToName[newMatch.teamB]
				delete newMatch._id;
				res.end(JSON.stringify(newMatch, null, "   "))
				next()
				return
			}).catch((error) => {
				// ????
			})
	})

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

app.post('/login', function(req, res, next) {

	let profilePromise;

	// facebook login
	if(req.body.fb_access_token) {
		profilePromise =
			getFacebookProfile(req.body.fb_access_token)
				.then((fbProfile) => {
					// convert the fbProfile into one of ours that we store in the database
					let profile = Object.assign({}, fbProfile, {
						fb_access_token: req.body.fb_access_token
					})
					return _(profile).mapKeys((v, k) => ({ id: 'fb_user_id' })[k] || k).value()
				})
	}
	// user credentials login
	else if(req.body.email && req.body.password) {
		profilePromise =
			verifyCredsAndGetProfile(_.pick(req.body, 'email', 'password'))
	}
	// invalid request
	else {
		forbiddenRespond({ error: 'no access_token or credentials supplied' }, next, res)
		return
	}

	profilePromise
		.then(attachFutsalAccessToken)
		.then(upsertProfile)
		.then((profile) => profile.futsal_access_token)
		.then((token) => {
			okRespond({ futsal_access_token: token }, next, res)
		})
		.catch((error) => {
			forbiddenRespond({ error: error.message }, next, res)
		})

});

function getFacebookProfile(access_token) {
	console.log('in getFacebookProfile')
	return fetch("https://graph.facebook.com/me?fields=id,email,name&access_token=" + access_token)
		.then((res) => res.json())
		.then((json) => {
			if(json.error) return Promise.reject(Error('Error from FB graph API: ' + json.error.message))
			else return json
		})
}

function verifyCredsAndGetProfile(creds) {
	creds.password = crypto.createHmac('sha256', creds.password).digest('hex')
	console.log('creds', creds)
	console.log('_.assign({}, { is_active: true })', _.assign({}, { is_active: true }))
	return db.collection('user').findOne(_.assign({}, { is_active: true }))
		.then((doc) => {
			if(!doc) return Promise.reject(Error('credentials do not match any users'))
			else return doc
		})
}

function upsertProfile(profile) {
	console.log('in upsertProfile')
	return db.collection('user').update(
			{ email: profile.email },
			{ $set: profile },
			{ upsert: true }
		)
		.then((writeResult) => {
			if(writeResult.result.writeConcernError) {
				return Promise.reject(Error(writeResult.result.writeConcernError))
			}
			return profile
		})
}

// let attachToObject = _.curry((objectToAttach, targetObject) => Object.assign(targetObject, objectToAttach))
// let attachFutsalAccessToken = attachToObject({ futsal_access_token: crypto.randomBytes(32).toString('base64') })

function attachFutsalAccessToken(profile) {
	console.log('in attachFutsalAccessToken')
	profile['futsal_access_token'] = crypto.randomBytes(32).toString('base64')
	return profile
}

app.get('/profile', function(req, res, next) {

	if(req.query.futsal_access_token) {
		db.collection('user').findOne({
			futsal_access_token: req.query.futsal_access_token
		})
			.then((profile) => {
				if(!profile) throw Error('No matching users')
				return profile
			})
			.then((profile) => {
				okRespond({ profile }, next, res)
			})
			.catch((error) => {
				forbiddenRespond({ error: error.message }, next, res)
			})
	} else {
		forbiddenRespond({ error: 'Must contain a futsal_access_token' }, next, res)
		return
	}
})

app.post('/register', function(req, res, next) {

	console.log(req.body)

	// validate fields
	var requiredFields = ['email', 'password']
	// var optionalFields = ['name']
	// var allFields = requiredFields.concat(optionalFields)
	var allFields = requiredFields

	var missingRequiredFields = requiredFields
		.filter((requiredField) => !req.body[requiredField])
	if(missingRequiredFields.length) {
		respond(400, {
			error: 'Missing required fields: ' + missingRequiredFields.join(', ')
		}, next, res)
		return
	}

	// get the data in the form that we want
	var data = _(req.body).pick.apply(_(req.body), allFields).value()

	// add and modify fields
	data.password = crypto.createHmac('sha256', data.password).digest('hex')
	data.activation_key = crypto.randomBytes(32).toString('base64')
	data.is_active = false

	// insert the record into the database
	let responseJson;
	let dbPromise = db.collection('user').insertOne(data)
		.then((result) => {
			if(result.result.ok) return result.ops[0]
			else throw Error('Record insertion error')
		})
		// keep track of the json for the reponse
		.then(json => responseJson = json)
		.then(json => { console.log('responseJson > ', responseJson); return responseJson })
		// attempt to send the email now we know the record is saved
		.then(() => sendActivationEmail(
			responseJson.email,
			{
				name: responseJson.name,
				activation_key: querystring.escape(data.activation_key)
			}))
		// send response
		.then(() => okRespond(responseJson, next, res))
		.catch(error => internalServerError({ error: error.message }, next, res))
})

const sendEmail = _.curry((from, subject, template, to, values) => {
	return new Promise((resolve, reject) => {
		console.log('values', values)
		let text = handlebars.compile(template)(values)
		console.log('email body', text)

		var api_key = 'key-d0846a9ba516e948473c6b769416b925';
		var domain = 'mailgun.richgarner.net';
		var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

		mailgun.messages().send({from, to, subject, text}, function (error, body) {
		  if(error) reject(Error(error))
		  else resolve(body)
		});
	})
})
const sendAdminEmail = sendEmail('no-reply@jumpersforgoalposts.com')
const sendActivationEmail = sendAdminEmail(
	'"Jumpers for Goalposts" activation',
	"Hi {{name}},\nPlease activate your account by clicking on this link:\nhttp://localhost:3080/activate?activation_key={{{activation_key}}}" /// triple '{' means handlebars won't escape the value! 
)

app.get('/activate', function(req, res, next) {

	console.log(req.query)

	// validate fields
	var requiredFields = ['activation_key']
	// var optionalFields = ['name']
	// var allFields = requiredFields.concat(optionalFields)
	var allFields = requiredFields

	var missingRequiredFields = requiredFields
		.filter((requiredField) => !req.query[requiredField])
	if(missingRequiredFields.length) {
		respond(400, {
			error: 'Missing required fields: ' + missingRequiredFields.join(', ')
		}, next, res)
		return
	}

	// get the data in the form that we want
	var data = _(req.query).pick.apply(_(req.query), allFields).value()

	db.collection('user').update(
		data,
		{ $set: { is_active: true }, $unset: { activation_key: 1 } }
	)
	.then((writeResult) => {
		if(writeResult.result.writeConcernError) {
			return Promise.reject(Error(writeResult.result.writeConcernError))
		}
		okRespond({ status: 'OK' }, next, res)
	})
	.catch((error) => {
		internalServerError({ error: error.message }, next, res)
	})
})

MongoClient.connect(url, function(err, dbHandle) {

	assert.equal(null, err);
	db = dbHandle;
	console.log("Connected to MongoDB, starting HTTP server...");

	var HttpPort = 3080;
	var HttpsPort = 3443;

	// see available options here
	//	https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
	const options = {
		key: fs.readFileSync('ssl_keys/key.pem'),
		cert: fs.readFileSync('ssl_keys/cert.pem'),
		requestCert: false // this is the default anyway but let's be explicit
	};

	http.createServer( app).listen(HttpPort, function(req, res) {
		console.log('...http listening on ', HttpPort);
	});

	https.createServer(options, app).listen(HttpsPort, function(req, res) {
		console.log('...https listening on ', HttpsPort);
	});

});
