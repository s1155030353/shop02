var express = require('express');
var anyDB = require('any-db');
var config = require('../shopXX-ierg4210.config.js');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer = require('multer');
var fs = require('fs');
var csp = require('content-security-policy');

var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
var inputPattern = {
	name: /^[\w- ']+$/,
	description: /^[\w- ',\r\n]+$/,
	price: /^\d+(?:\.\d{1,2})?$/
};

//var RedisStore = require('connect-redis')(session);

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
};

var globalCSP = csp.getCSP(cspPolicy);

var app = express.Router();

app.use(globalCSP);

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
// this line must be immediately after express.bodyParser()!
// Reference: https://www.npmjs.com/package/express-validator
app.use(expressValidator());
//app.use(express.bodyParser({uploadDir:'../public/images/'}));
app.use(multer({ dest: './public/images/'}))

// URL expected: http://hostname/admin/api/cat/add
app.post('/', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('name', 'Invalid Category Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('INSERT INTO categories (name) VALUES (?)', 
		[req.body.name],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			//alert("New category added.");

			//res.status(200).json(result).end();
			res.redirect('/admin');
		}
	);

});