var express = require('express');
var anyDB = require('any-db');
var config = require('../shopXX-ierg4210.config.js');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var crypto = require('crypto');
var xssFilters = require('xss-filters');
var session = require('express-session');
var csp = require('content-security-policy');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
//var RedisStore = require('connect-redis')(session);

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
};

var globalCSP = csp.getCSP(cspPolicy);
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });

var app = express.Router();

app.use(globalCSP);

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended:true}));

app.use(expressValidator());

app.use(session({
//	store:new RedisStore({
//        host:'127.0.0.1',
//        port:'6379'
//    }),
	name: 'login',
	secret: '04n4MY7jLXKlz3y17YdoSOR9o71gvH3R',
	resave: false,
	saveUninitialized: false,
	cookie: { path: '/admin', maxAge: 1000*60*60*24*3, httpOnly: true }
	})
);

var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 10
});

var inputPattern = {
	username: /^[\w- ']+$/,
	password: /^\d+(?:\.\d{1,2})?$/
};

app.post('/', parseForm, csrfProtection, function (req, res, next) {
/*
	if (req.session.user){
		if (req.session.admin){
			res.redirect('/admin');
		}
		else{
			redirect('/');
		}
	}
	else{
		res.redirect('/admin/login');
	}
*/
//console.log(req.body);
	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
/*	req.checkBody('email', 'Invalid Email Address')
		.isLength(1, 512)
		.matches(inputPattern.email);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}
*/
	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)

	req.checkBody('username', 'Invalid Username')
		.isLength(1, 512)
		.matches(inputPattern.username);
	req.checkBody('password', 'Invalid Password')
		.isLength(1, 512)
		.matches(inputPattern.password);

	if (req.validationErrors()) {
		return res.status(400).json({'Invalid Input': req.validationErrors()}).end();
	}

	function hmacPassword (password,salt) {
		var hmac = crypto.createHmac('sha256', salt);
		//console.log(salt); // zhu
		hmac.update(password);
		return hmac.digest('base64');
	}

	pool.query('SELECT * FROM users WHERE username = ? LIMIT 1',
		[xssFilters.inHTMLData(req.body.username)],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			var submitedSaltedPassword = hmacPassword(xssFilters.inHTMLData(req.body.password),xssFilters.inHTMLData(result.rows[0].salt));
			//console.log(submitedSaltedPassword); //I made a mistake here and this is how to debug
			//console.log(result.rows[0].saltedPassword); // Output in the right position.
			// Didn’t pass the credential.
			if (result.rowCount === 0 || result.rows[0].saltedPassword != submitedSaltedPassword) {
				return res.status(400).json({'loginError': 'Invalid Credentials'}).end();
			}
			req.session.regenerate(function(err) {
			//The purpose for these parts of codes would be covered later.
				req.session.username = xssFilters.inHTMLData(req.body.username);
				req.session.admin = result.rows[0].admin;
				//res.status(200).json({'login OK': 1}).end();
				res.redirect('/admin');
			});
		}
	);

});

module.exports = app;