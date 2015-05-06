var express = require('express');
var anyDB = require('any-db');
var config = require('../shopXX-ierg4210.config.js');
var session = require('express-session');
var csp = require('content-security-policy');
//var RedisStore = require('connect-redis')(session);

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
};

var globalCSP = csp.getCSP(cspPolicy);

var app = express.Router();

app.use(globalCSP);

app.use(session({
//	store:new RedisStore({
//        host:'127.0.0.1',
//        port:'6379'
//    }),
	name: 'login',
	secret: '04n4MY7jLXKlz3y17YdoSOR9o71gvH3R',
	resave: false,
	saveUninitialized: false,
	cookie: { path: '/', maxAge: 1000*60*60*24*3, httpOnly: true }
	})
);

app.get('/', function (req, res) {
	if (req.session.admin == 1){
		req.session.destroy(function(err) {
			res.redirect('/admin/login');
		});
	}
	if (req.session.admin == 0){
		req.session.destroy(function(err) {
			res.redirect('/');
		});
	}
	//console.log(req);
	
});

module.exports = app;