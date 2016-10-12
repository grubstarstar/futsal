"use strict"

var express = require('express')
var router = express.Router()

var fetch = require('isomorphic-fetch')
var querystring = require('querystring')
var crypto = require('crypto')

var sendAdminEmail = require('./helpers').sendAdminEmail

module.exports = (db) => {

	router.post('/register', function(req, res, next) {

		// validate and sanitize data
		let data = sanitize(
			data.query,
			['email', 'password'],	// required
			[]						// optional
		)
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
			// attempt to send the email now we know the record is saved
			.then(() => sendActivationEmail(
				responseJson.email,
				{
					name: responseJson.name,
					activation_key: querystring.escape(data.activation_key)
				}))
			// send response
			.then(() => res.status(200).end(JSON.stringify(responseJson)))
			.catch(error => next({ error: error.message }))
	})

	router.get('/activate', function(req, res, next) {

		// validate and sanitize data
		let data = sanitize(
			data.query,
			['activation_key'],	// required
			[]					// optional
		)

		db.collection('user').update(
			data,
			{ $set: { is_active: true }, $unset: { activation_key: 1 } }
		)
		.then((writeResult) => {
			if(writeResult.result.writeConcernError) {
				return Promise.reject(Error(writeResult.result.writeConcernError))
			}
			res.status(200).end(JSON.stringify({ status: 'OK' }))
		})
		.catch((error) => {
			next({ error: error.message })
		})
	})

	router.post('/login', function(req, res, next) {

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
			next({ code: 401, error: 'no access_token or credentials supplied' })
			return
		}

		profilePromise
			.then(attachFutsalAccessToken)
			.then(upsertProfile)
			.then((profile) => profile.futsal_access_token)
			.then((token) => {
				res.status(200).end(JSON.stringify({ futsal_access_token: token }))
			})
			.catch((error) => {
				next({ error: error.message })
			})

	});

	router.get('/profile', function(req, res, next) {
		if(req.authenticatedUser) {
			res.status(200).end(JSON.stringify({ profile }))
		} else {
			return next({ code: 401, error: 'must contain a futsal_access_token' })
		}
	})


	return router
}

// private helper functions
function getFacebookProfile(access_token) {
	return fetch("https://graph.facebook.com/me?fields=id,email,name&access_token=" + access_token)
		.then((res) => res.json())
		.then((json) => {
			if(json.error) return Promise.reject(Error('error from FB graph API: ' + json.error.message))
			else return json
		})
}

function verifyCredsAndGetProfile(creds) {
	creds.password = crypto.createHmac('sha256', creds.password).digest('hex')
	return db.collection('user').findOne(_.assign({}, { is_active: true }))
		.then((doc) => {
			if(!doc) return Promise.reject(Error('credentials do not match any users'))
			else return doc
		})
}

function upsertProfile(profile) {
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

function attachFutsalAccessToken(profile) {
	profile['futsal_access_token'] = crypto.randomBytes(32).toString('base64')
	return profile
}

// a more specific version of the curried sendAdminEmail function
const sendActivationEmail = sendAdminEmail(
	'"Jumpers for Goalposts" activation',
	"Hi {{name}},\nPlease activate your account by clicking on this link:\nhttp://localhost:3080/activate?activation_key={{{activation_key}}}" /// triple '{' means handlebars won't escape the value! 
)