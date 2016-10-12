"use strict"

// middleware for authentication
const authenticationMiddleware = (db) => {
	return (req, res, next) => {
		if(req.query.futsal_access_token) {
			db.collection('user').findOne({
				futsal_access_token: req.query.futsal_access_token
			})
				.then((profile) => {
					if(profile) req.authenticatedUser = profile
					return next()
				})
				.catch((error) => {
					next({ message: error.message })
				})
		}
	}
}

// just logs HTTP request basics to console.log
function loggingMiddleware(req, res, next) {
	console.log(`>> %s %s`, req.method, req.url)
	if(req.body) {
		console.log('   DATA', req.body)
	}
	return next()
}

// middleware to handle all thrown exceptions and turn them into HTTP error responses
function errorMiddleware(err, req, res, next) {
	res.status(err.code || 500)
	.end(JSON.stringify({
		status: 'ERROR',
		error: err.message
	}))
}

// the exports
module.exports = {
	authenticationMiddleware,
	loggingMiddleware,
	errorMiddleware
}