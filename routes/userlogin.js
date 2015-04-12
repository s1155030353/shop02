var express = require('express');
var anyDB = require('any-db');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('../shopXX-ierg4210.config.js');
//var expressValidator = require('express-validator');

var csp = require('content-security-policy');
var session = require('express-session');
//var RedisStore = require('connect-redis')(session);
var csrf = require('csurf');
var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
};

var globalCSP = csp.getCSP(cspPolicy);

var app = express.Router();

app.use(globalCSP);
var csrfProtection = csrf({ cookie: true });
var parseForm = bodyParser.urlencoded({ extended: false });
app.use(cookieParser());

var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 10
});

app.use(session({
//	store:new RedisStore({
//        host:'127.0.0.1',
//        port:'6379'
//    }),
	name: 'login',
	secret: '04n4MY7jLXKlz3y17YdoSOR9o71gvH3R',
	resave: false,
	saveUninitialized: false,
	cookie: { path: '/account', maxAge: 1000*60*60*24*3, httpOnly: true }
	})
);
/*
var inputPattern = {
//	email: /^[\w- ']+$/,
};
*/
// URL expected: http://hostname/login
app.get('/', csrfProtection, function (req, res) {
//	console.log(req);
	if (req.session.admin == 0){
		return res.redirect('/');
	}

	res.render('userlogin-panel', {
		layout: 'admin',
		title: 'IERG4210 ShopXX Login',
		csrfToken: req.csrfToken()
	});

});

/*
app.post('/validate', function (req, res) {
console.log(req.body);
	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('email', 'Invalid Email Address')
		.isLength(1, 512)
		.matches(inputPattern.email);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('SELECT admin FROM users WHERE email=? AND saltpasswd=?', 
		[req.body.email, req.body.password],
		function (error, result) {
			if (result.affectedRows !== 0) {
				if (error) {
						console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
				}
				if (admin == 1){
					res.redirect('/admin');
				}
				else{
					res.redirect('/admin/login');
				}
			}
			else{
				res.redirect('/admin/login');
				alert("Your Email or password may be wrong, please try again.");
			}	
		}
	);

});
*/
module.exports = app;