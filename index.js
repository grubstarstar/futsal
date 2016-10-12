"use strict"

var http = require('http')
var https = require('https')
var fs = require('fs')

var express = require('express')
var bodyParser = require('body-parser')

var MongoClient = require('mongodb').MongoClient, assert = require('assert')
var mongoUrl = 'mongodb://localhost:27017/futsal'

var app = express()

// now we are ready to connect to MongoDB and start listening
MongoClient.connect(mongoUrl, function(err, dbh) {

	// middleware for serving the static website and it's bower modules
	app.use(express.static('public'))
	app.use(express.static('bower_components'))

	// make the 'res' body a json parsed object when Content-Type: application/json
	app.use(bodyParser.json())

	// logging middleware
	app.use(require('./server/middleware').loggingMiddleware)
	app.use(require('./server/middleware').authenticationMiddleware(dbh))

	// the main routers of the API
	app.use('/match', require('./server/Match')(dbh))
	app.use('/team', require('./server/Team')(dbh))
	app.use('/user', require('./server/User')(dbh))
	app.use('/table', require('./server/Table')(dbh))

	// custom error middleware
	app.use(require('./server/middleware').errorMiddleware)

	console.log("Connected to MongoDB, starting HTTP server...")

	var HttpPort = 3080
	var HttpsPort = 3443

	// see available options here
	//	https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
	const options = {
		key: fs.readFileSync('ssl_keys/key.pem'),
		cert: fs.readFileSync('ssl_keys/cert.pem'),
		requestCert: false // this is the default anyway but let's be explicit
	}

	http.createServer(app).listen(HttpPort, function(req, res) {
		console.log('...http listening on ', HttpPort)
	})

	https.createServer(options, app).listen(HttpsPort, function(req, res) {
		console.log('...https listening on ', HttpsPort)
	})

})
