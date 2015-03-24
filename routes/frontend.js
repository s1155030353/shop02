var express = require('express');
var anyDB = require('any-db');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('../shopXX-ierg4210.config.js');
var csp = require('content-security-policy');
//var RedisStore = require('connect-redis')(session);
//var csrf = require('csurf');
var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
};

var globalCSP = csp.getCSP(cspPolicy);

var app = express.Router();

app.use(globalCSP);
//var csrfProtection = csrf({ cookie: true });
//var parseForm = bodyParser.urlencoded({ extended: false });
//app.use(cookieParser());
//app.use(csrf);

var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 10
});
//console.error(error);

app.get('/', function (req, res) {

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
		    res.render('main', {
				layout: 'main',
				title: 'IERG4210 Shop02',
				cat: categories.rows,
				prod: products.rows,
				//csrfToken: req.csrfToken()
	    	});
	    	//console.log(categories.rows);
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
		    res.render('main', {
				layout: 'main',
				title: 'IERG4210 Shop02',
				cat: categories.rows,
				prod: products.rows,
				//csrfToken: req.csrfToken()
	    	});
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