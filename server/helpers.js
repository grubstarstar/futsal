"use strict"

var _ = require('lodash')
var mailgun = require('mailgun-js')({ apiKey: 'key-d0846a9ba516e948473c6b769416b925', domain: 'mailgun.richgarner.net' });
var handlebars = require('handlebars')

// used to sanitize and validate either query, json body or params, depending
// on what is passed. Will return the sanitized data or return next with an error.
function sanitize(params, required, optional) {

	// derive all fields from optional and required
	var allFields = required.concat(optional)

	// find missing required fields
	var missingRequiredFields = required
		.filter((requiredField) => !params[requiredField])

	// chuck a 400 reponse if there are missing required fields
	if(missingRequiredFields.length) {
		throw {
			code: 422,
			message: 'Missing required fields: ' + missingRequiredFields.join(', ')
		}
	}

	// filter out any parameters that we didn't expect
	return _(params).pick.apply(_(params), allFields)
}

// a curried functions for sending emails
const sendEmail = _.curry((from, subject, template, to, values) => {
	return new Promise((resolve, reject) => {
		let text = handlebars.compile(template)(values)
		mailgun.messages().send({from, to, subject, text}, function (error, body) {
		  if(error) reject(Error(error))
		  else resolve(body)
		});
	})
})

// a more specific email function to send form the administrator
const sendAdminEmail = sendEmail('no-reply@jumpersforgoalposts.com')

module.exports = { sanitize, sendEmail, sendAdminEmail }