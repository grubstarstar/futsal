"use strict"

var express = require('express')
var router = express.Router()

var moment = require('moment')

module.exports = (db) => {

	router.get('/', function(req, res, next) {

		// the MongoDB collections
		var match = db.collection('match')
		var team = db.collection('team')

		// fetch the football matches from the database
		match.find({}).toArray(function(err, matches) {

			var matchesByTeam = []

			// organise the matches by team...
			matches.forEach(function(match) {
				// if the match isn't finished, we'll skip it
				if(moment(match.kickOffAt).add(90, 'minutes').isAfter(moment())) {
					return
				}
				matchesByTeam[match.teamA.toHexString()] = matchesByTeam[match.teamA.toHexString()] || []
				matchesByTeam[match.teamB.toHexString()] = matchesByTeam[match.teamB.toHexString()] || []
				matchesByTeam[match.teamA.toHexString()].push(match)
				matchesByTeam[match.teamB.toHexString()].push(match)
			})

			// sort the matches in chronological order for each team. This helps
			// us work the last two games and whether they've moved up or down.
			for(var teamId in matchesByTeam) {
				matchesByTeam[teamId] = _(matchesByTeam[teamId]).sortBy(function(match) {
					return new Date(match.kickOffAt)
				})
			}

			// now fetch the teams out of the database
			team.find({}).toArray(function(err, teams) {

				// build a lookup of team ID to name
				var teamIdName = {}
				teams.forEach(function(team) {
					teamIdName[team._id] = team.name
				})

				// this will hold the table stats for each team at the
				// current time, once we've iterated through them fully
				var teamStats = {}
				// this will hold a snapshot of the stats at the game
				// before last. We need this to work out if there has been
				// a change in position since the last game was played.
				var teamStatsAtGameBeforeLast = {}

				// go through the teams and create the stats for each
				teams.forEach(function(team, idx, arr) {

					// things we will reuse in this loop
					var teamId = team._id.toHexString()
					var teamMatches = matchesByTeam[teamId]

					if (!teamMatches) return

					// initilise stats
					teamStats[team.name] = teamStats[team.name] || {}
					teamStats[team.name].played = teamStats[team.name].played || 0
					teamStats[team.name].won = teamStats[team.name].won || 0
					teamStats[team.name].lost = teamStats[team.name].lost || 0
					teamStats[team.name].drawn = teamStats[team.name].drawn || 0
					teamStats[team.name].goalsFor = teamStats[team.name].goalsFor || 0
					teamStats[team.name].goalsAgainst = teamStats[team.name].goalsAgainst || 0
					teamStats[team.name].goalDiff = teamStats[team.name].goalDiff || 0
					teamStats[team.name].points = teamStats[team.name].points || 0
					teamStats[team.name].position = teamStats[team.name].position || 0
					teamStats[team.name].lastFive = teamStats[team.name].lastFive || []

					// go through each match the team has played, working out stats for the team as we go
					teamMatches.forEach(function(match, idx, arr) {
						
						var teamKey = (teamId == match.teamA) ? 'teamA' : 'teamB'
						var otherTeamKey = (teamId == match.teamA) ? 'teamB' : 'teamA'

						var goals = {
							teamA: parseInt(match.teamA_Goals),
							teamB: parseInt(match.teamB_Goals)
						}

						// calculate how many the teams have Played
						teamStats[team.name].played++

						// calculate the wins / draws / loses
						if( goals[teamKey] == goals[otherTeamKey] ) {
							teamStats[team.name].drawn++
							teamStats[team.name].points += 1
						}
						else if( goals[teamKey] > goals[otherTeamKey] )
						{
							teamStats[team.name].won++
							teamStats[team.name].points += 3
						}
						else
						{
							teamStats[team.name].lost++
						}
						
						// calculate the Goal Difference
						teamStats[team.name].goalDiff += goals[teamKey] - goals[otherTeamKey]

						// goals For...
						teamStats[team.name].goalsFor += goals[teamKey]

						// ...and Against
						teamStats[team.name].goalsAgainst += goals[otherTeamKey]

						// when we're about to move on to the stats for the last match, take a
						// snapshot of the state of the teamStats so we can decipher whether
						// they've gone up or down since the game before last.
						if(idx == teamMatches.length - 2) {
							teamStatsAtGameBeforeLast[team.name] = _.clone(teamStats[team.name])
						}

						var otherTeamName = teamIdName[match[otherTeamKey]]

						if(idx >= teamMatches.length - 5) {
							teamStats[team.name].lastFive.push({
								goalsFor: goals[teamKey],
								goalsAgainst: goals[otherTeamKey],
								playingAgainst: otherTeamName,
								kickOffAt: match.kickOffAt
							})
						}

					})
				})

				// worjk out the rank of the teams now and before the last game
				var teamRankAtGameBeforeLast = {}
				var position = 1

				_.chain(teamStatsAtGameBeforeLast)
					.keys()
					.sortBy(function(teamName) {
						return -teamStatsAtGameBeforeLast[teamName].points
					})
					.each(function(teamName) {
						teamRankAtGameBeforeLast[teamName] = position++
					})
					.value()

				var teamRank = {}
				position = 1

				_.chain(teamStats)
					.keys()
					.sortBy(function(teamName) {
						return -teamStats[teamName].points
					})
					.each(function(teamName) {
						teamRank[teamName] = position++
					})
					.value()

				// now we can use the teamStats to calculte new teamStats...

				// calculate the Points and add the team name, then fill in the gaps
				teams.forEach(function(team) {

					if (!teamStats[team.name]) return

					teamStats[team.name].name = team.name
					teamStats[team.name].position = teamRank[team.name]
					
					// add a property showing whether the team has moved up, down or stayed at the smae position since the last game.
					if(teamRank[team.name] < teamRankAtGameBeforeLast[team.name]) {
						teamStats[team.name].moved = 'up'
					} else if(teamRank[team.name] > teamRankAtGameBeforeLast[team.name]) {
						teamStats[team.name].moved = 'down'
					} else {
						teamStats[team.name].moved = 'stay'
					}

				})

				res.end(
					JSON.stringify(
						_.sortBy(teamStats, function(stat) { return -stat.points }),
						undefined,
						"   "
					)
				)

				return next()
			})

		})

	})
	
	return router
}