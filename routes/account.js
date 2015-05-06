var express = require('express');
var anyDB = require('any-db');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('../shopXX-ierg4210.config.js');
var session = require('express-session');
var csp = require('content-security-policy');
var csrf = require('csurf');
var RedisStore = require('connect-redis')(session);

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1"
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
//        store:new RedisStore({
//            host:'127.0.0.1',
//            port:'6379'
//        }),
        name: 'login',
        secret: '04n4MY7jLXKlz3y17YdoSOR9o71gvH3R',
        resave: false,
        saveUninitialized: false,
        cookie: { path: '/', maxAge: 1000*60*60*24*3, httpOnly: true }
    })
);

// URL expected: http://hostname/admin
//app.get('/', csrfProtection, function (req, res) {
app.get('/', csrfProtection, function (req, res) {
    /*
     var schema = req.headers['x-forwarded-proto'];
     if (schema === 'https') {// Redirect to https.
     res.redirect('https://' + req.headers.host + req.url);
     }
     */
    console.log(req.session);
    console.log("account");
    if (!req.session){
        res.redirect('/account/login');
        return;
    }
    if (req.session.admin != 0){
        res.redirect('/account/login');
        return;
    }

    // async fetch data from SQL, render page when ready
    pool.query('SELECT * FROM categories', function (error, categories) {
        if (error) {
            console.error(error);
            res.status(500).end();
            return;
        }

        pool.query('SELECT * FROM products', function (error, products) {
            if (error) {
                console.error(error);
                res.status(500).end();
                return;
            }

            res.render('account-panel', {
                layout: 'admin',
                title: 'IERG4210 ShopXX Account',
                cat: categories.rows,
                prod: products.rows,
                csrfToken: req.csrfToken()
            });

        });
    });
});

module.exports = app;