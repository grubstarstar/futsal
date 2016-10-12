"use strict"

var express = require('express')
var router = express.Router()

module.exports = (db) => {
	
	router.getTeams = function(where) {
		where = where || {}
		return db.collection('team')
			.find(where)
			.toArray()
	}
	
	return router
}
