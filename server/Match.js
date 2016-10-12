"use strict"

var _ = require('lodash')

var express = require('express')
var router = express.Router()

var ObjectID = require('mongodb').ObjectID

var sanitize = require('./helpers').sanitize

module.exports = (db) => {

	var getTeams = require('./Team')(db).getTeams

	/* GET - all matches that are owned by the authenticated user */
	router.get('/admin', function(req, res, next) {

		// validate and sanitize data
		let data = sanitize(
			req.query,
			['futsal_access_token'],	// required
			[]							// optional
		)
		// get the teams that are owned by the authenticated user
		getTeams({ owner_id: req.authenticatedUser._id })
			.then((teams) => {
				var teamsIds = _(teams).map(team => team._id).value();
				return getMatches({
					$or: [{
						teamA: { $in: teamsIds }
					},{
						teamB: { $in: teamsIds }
					}]
				})
			})
			.then((matches) => {
				res.end(JSON.stringify(_.values(matches), undefined, "   "))
				return next()
			})
			.catch(error => next(error))
	})

	/* GET - all matches that are owned by the authenticated user */
	router.get('/player', function(req, res, next) {
		// validate and sanitize data
		sanitize(
			req.query,
			['futsal_access_token'],	// required
			[]							// optional
		)
		// get the teams that have the authenticatedUser as a player
		getTeams({
			players: {
				$elemMatch: { _id: req.authenticatedUser._id }
			}
		})
			.then((teams) => {
				var teamsIds = _(teams).map(team => team._id);
				return getMatches({
					$or: [{
						teamA: { $in: teamsIds },
						teamB: { $in: teamsIds }
					}]
				})
			})
			.then((matches) => {
				res.end(JSON.stringify(_.values(matches), undefined, "   "))
				return next()
			})
	})

	/* POST - creates a new match */
	router.post('/', function(req, res, next) {

		// validate and sanitize data
		let data = sanitize(
			req.body
			['teamA', 'teamB', 'kickOffAt'],	// required
			['teamA_Goals', 'teamB_Goals']		// optional
		)
		
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
					return next(error)
				})
		})

	});

	/* PUT - updates a match, only allows updating of the goals, i.e. for creating a result from
	a fixture. If dates and teams are incorrect you have to delete the match and recreate */
	router.put('/:id', function(req, res, next) {

		// validate and sanitize data
		let data = sanitize(
			Object.assign(req.body, req.param),
			['id', 'teamA_Goals', 'teamB_Goals'],	// required
			[]										// optional
		)

		db.collection('match').updateOne(
			{ _id: ObjectID.createFromHexString(data.id) },
			{ $set: _(data).pick('teamA_Goals', 'teamB_Goals') }
		)
		.then((result) => {
			db.collection('match').findOne({
				_id: ObjectID.createFromHexString(data.id)
			})
		})
		.then((match) => {
			match.id = match._id;
			delete match._id;
			res.end(JSON.stringify(match));
			next();
		})
		.catch((error) => {
			return next(error)
		})
	})

	/* DELETE - deletes the match*/
	router.delete('/:id', function(req, res, next) {
		
		// validate and sanitize data
		let data = sanitize(
			data.params,
			['id'],	// required
			[]		// optional
		)

		// get the ID as stored in mongo
		let _id = ObjectID.createFromHexString(data.id)

		// get the match first so we're able to send back
		// the document we're deleting in the response
		let responseData = {}
		db.collection('match').findOne({
			_id: _id
		})
		.then(match => {
			if(!match) throw Error("This match doesn't exist")
			return match
		})
		.then((match) => {
			responseData = match
			responseData.id = responseData._id
			delete responseData._id
			return match
		})
		.then((match) => {
			return db.collection('match').removeOne(
				{ _id: _id }
			)
		})
		.then((result) => {
			res.status(200).end(JSON.stringify(responseData));
			next();
		})
		.catch((error) => {
			return next(error)
		})
		
	});

	/* helper functions */
	function getMatches(where) {
		where = where || {}
		let matchStats = {};
		return db.collection('match')
			.find(where)
			.toArray()
			.then((matches) => {
				return Promise.all(
					_(matches).map((match) => {
						return Promise.all([
							db.collection('team').findOne({
								_id: match.teamA
							}),
							db.collection('team').findOne({
								_id: match.teamB
							})
						])
						.then((teams) => {
							matchStats[match._id] = {
								id: match._id,
								teamA: teams[0].name,
								teamA_Goals: match.teamA_Goals,
								teamB: teams[1].name,
								teamB_Goals: match.teamB_Goals,
								kickOffAt: match.kickOffAt
							};
						})
					})
				)
				.then(() => {
					return matchStats
				})
			})
	}

	return router
}