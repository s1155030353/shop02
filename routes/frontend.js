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
//var csrf = require('csurf');
var RedisStore = require('connect-redis')(session);

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
};

var globalCSP = csp.getCSP(cspPolicy);
//var csrfProtection = csrf({ cookie: true });
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
	cookie: { path: '/', maxAge: 1000*60*60*24*3, httpOnly: true }
	})
);

var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 10
});

app.get('/', function (req, res) {
//	if (!req.session){
//		req.session.regenerate(function(error){

//		});
//	}
//console.log(req.session);
pool.query('CREATE TABLE payment(payid int(11) PRIMARY KEY, userid int(11), paymentid varchar(512), state varchar(20), dateCreated datetime)', function (error) {
        if (error) {
            console.error(error);
            res.status(500).end();
            return;
        }

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
            console.log(req.session);
		    if (!req.session || req.session.admin == undefined){
		    //console.log(req.session.admin);
		    /*if (req.session.admin == 1 || req.session.admin == 0){
		    	res.render('main', {
					layout: 'main',
					title: 'IERG4210 Shop02',
					cat: categories.rows,
					prod: products.rows,
					admin: '',
					user: '',
					logout: 'Logout'
					//state: '<a href="/admin/logout">Log out</a>'
					//state: req.session.admin
					//csrfToken: req.csrfToken()
	    		});
		    }
			}*/
		    //else{
		    	res.render('main', {
					layout: 'main',
					title: 'IERG4210 Shop02',
					cat: categories.rows,
					prod: products.rows,
					admin: 'Admin Log In',
					user: 'User Log In',
					logout: ''
					//state: '<a href="/admin">Admin Log in</a>&nbsp;&nbsp;<a href="/account/login">User Log in</a>&nbsp;&nbsp;'
					//state: '3'
					//csrfToken: req.csrfToken()
	    		});
		    }
            else{
                if (req.session.admin == 0){
                    res.render('main', {
                        layout: 'main',
                        title: 'IERG4210 Shop02',
                        cat: categories.rows,
                        prod: products.rows,
                        username: req.session.username,
                        admin: '',
                        user: '',
                        logout: 'Logout'
                        //state: '<a href="/admin/logout">Log out</a>'
                        //state: req.session.admin
                        //csrfToken: req.csrfToken()
                    });
                }
                else{
                    res.render('main', {
                        layout: 'main',
                        title: 'IERG4210 Shop02',
                        cat: categories.rows,
                        prod: products.rows,
                        admin: '',
                        user: '',
                        logout: 'Logout'
                        //state: '<a href="/admin">Admin Log in</a>&nbsp;&nbsp;<a href="/account/login">User Log in</a>&nbsp;&nbsp;'
                        //state: '3'
                        //csrfToken: req.csrfToken()
                    });
                }
            }
		    

	    });
    });
});
})

app.get('/main', function (req, res) {

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
		    if (req.session.admin == 1 || req.session.admin == 0){
		    	res.render('main', {
					layout: 'main',
					title: 'IERG4210 Shop02',
					cat: categories.rows,
					prod: products.rows,
					admin: '',
					user: '',
					logout: 'Logout'
					//state: '<a href="/admin/logout">Log out</a>'
					//state: req.session.admin
					//csrfToken: req.csrfToken()
	    		});
		    }
		    else{
		    	res.render('main', {
					layout: 'main',
					title: 'IERG4210 Shop02',
					cat: categories.rows,
					prod: products.rows,
					admin: 'Admin Log In',
					user: 'User Log In',
					logout: ''
					//state: '<a href="/admin">Admin Log in</a>&nbsp;&nbsp;<a href="/account/login">User Log in</a>&nbsp;&nbsp;'
					//state: '3'
					//csrfToken: req.csrfToken()
	    		});
		    }
	    });   
    });
})

app.get("/category", function(req, res) {

			//console.log(req);
	pool.query('SELECT * FROM categories', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}

		pool.query('SELECT * FROM products WHERE catid=' + req.query.catid, function (error, products) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			//console.log(products);
			pool.query('SELECT name FROM categories WHERE catid=' + req.query.catid, function (error, catname){
				if (error) {
					console.error(error);
					res.status(500).end();
					return;
				}
				res.render('category', {
					layout: 'main',
					title: 'IERG4210 Shop02 ' + catname.rows[0].name,
					cat: categories.rows,
					prod: products.rows,
					catid: req.query.catid,
					name: catname.rows[0].name,
					//csrfToken: req.csrfToken()
				});
			});
		});
	});
});

app.get("/product", function(req, res) {

		//console.log(req);
	pool.query('SELECT * FROM categories', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		//console.log(categories);

		pool.query('SELECT * FROM products WHERE pid=' + req.query.pid, function (error, prod) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
		//console.log(prod);
			pool.query('SELECT * FROM categories WHERE catid=' + prod.rows[0].catid, function (error, prodcat){
				if (error) {
					console.error(error);
					res.status(500).end();
					return;
				}
				res.render('product', {
					layout: 'main',
					title: 'IERG4210 Shop02 ' + prod.rows[0].name,
					cat: categories.rows,
					prodcat: prodcat.rows[0],
					prod: prod.rows[0],
					//csrfToken: req.csrfToken()
				});
				//console.log(prodcat.rows);
				//console.log(prod.rows);
			});
		});
	});
});

app.get("/prod-info", function(req, res) {
	var sql = 'SELECT pid, name, price FROM products WHERE 0';
	for (var i in req.query.pids) {
		sql += ' OR pid=' + req.query.pids[i];
	}
	pool.query(sql, function (error, prods) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}

		var ret = {};
		for (var i in prods.rows) {
			var item = prods.rows[i];
			ret[item.pid] = { name: item.name, price: item.price };
		}

		res.status(200).json(ret);
	});
});

module.exports = app;