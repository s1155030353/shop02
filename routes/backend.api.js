var express = require('express');
var anyDB = require('any-db');
var config = require('../shopXX-ierg4210.config.js');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer = require('multer');
var fs = require('fs');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
var inputPattern = {
	name: /^[\w- ']+$/,
	description: /^[\w- ',\r\n]+$/,
	price: /^\d+(?:\.\d{1,2})?$/
};
var app = express.Router();

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
// this line must be immediately after express.bodyParser()!
// Reference: https://www.npmjs.com/package/express-validator
app.use(expressValidator());
//app.use(express.bodyParser({uploadDir:'../public/images/'}));
app.use(multer({ dest: './public/images/'}))

// URL expected: http://hostname/admin/api/cat/add
app.post('/cat/add', function (req, res) {

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

// URL expected: http://hostname/admin-api/cat/edit
app.post('/cat/edit', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();
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
	pool.query('UPDATE categories SET name = ? WHERE catid = ? LIMIT 1', 
		[req.body.name, req.body.catid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'catid', 
					msg: 'Invalid Category ID', 
					value: req.body.catid
				}]}).end();	
			}
			//alert("Catgory updated.");

			//res.status(200).json(result).end();
			res.redirect('/admin');
		}
	);
});

// URL expected: http://hostname/admin-api/cat/remove
app.post('/cat/remove', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
    pool.query('SELECT * FROM products WHERE catid = ? LIMIT 1',
    	[req.body.catid],
    	function (error, result){
    		//console.log(result.affectedRows);
    		if (result.affectedRows !== 0) {
    			pool.query('DELETE FROM categories WHERE catid = ? LIMIT 1', 
		            [req.body.catid],
		            function (error, result) {
			            if (error) {
				            console.error(error);
				            return res.status(500).json({'dbError': 'check server log'}).end();
			            }
	                    // construct an error body that conforms to the inputError format
			            if (result.affectedRows === 0) {
				            return res.status(400).json({'inputError': [{
					            param: 'catid', 
					            msg: 'Invalid Category ID', 
					            value: req.body.catid
				            }]}).end();	
			            }
			            //alert("Category removed.");

			            //res.status(200).json(result).end();
						res.redirect('/admin');
		            }
	            );
    		}
    		else{
    			return res.status(400).json({'inputError': [{
    				param: 'catid',
    				msg: 'The category has products',
    				value: req.body.catid
    			}]}).end();
    		}
    	}
    );
});

// URL expected: http://hostname/admin/api/prod/add
app.post('/prod/add', function (req, res) {
console.log(req);
	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('name', 'Invalid Product Name' + JSON.stringify(req.body.name))
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
	pool.query('INSERT INTO products (catid, name, price, description) VALUES (' + req.body.catid + ",'" + req.body.name + "'," + req.body.price + ",'" + req.body.description + "')", 
		[req.body.name],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

		    fs.renameSync(req.files.image.path, 'public/images/' + result.lastInsertId + '.jpg');
		    //alert("New product added.");
			//res.status(200).json(result).end();
			res.redirect('/admin');
		}
	);
});

// URL expected: http://hostname/admin-api/prod/edit
app.post('/prod/edit', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();
	req.checkBody('name', 'Invalid Product Name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('catid', 'Invalid Catgory ID')
		.notEmpty()
		.isInt();
	req.checkBody('description', 'Invalid Description')
		.notEmpty()
		.matches (inputPattern.description);
	req.checkBody('price', 'Invalid Price')
	    .notEmpty()
	    .matches(inputPattern.price);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('UPDATE products SET name = ?, description = ?, price = ? WHERE catid = ? AND pid = ? LIMIT 1', 
		[req.body.name, req.body.description, req.body.price, req.body.catid, req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'catid', 
					msg: 'Invalid Category ID', 
					value: req.body.catid
				}]}).end();	
			}
			//console.log(req.files.image);
			fs.renameSync(req.files.image.path, 'public/images/' + req.body.pid + '.jpg');
			//alert("Product updated.");
			//res.status(200).json(result).end();
			res.redirect('/admin');
		}
	);
});

// URL expected: http://hostname/admin-api/prod/remove
app.post('/prod/remove', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();
	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
    pool.query('DELETE FROM products WHERE catid = ? AND pid = ? LIMIT 1', 
		[req.body.catid, req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'pid',
					msg: 'Invalid Category ID or Product ID', 
					value: req.body.pid
				}]}).end();	
			}
			fs.unlinkSync('public/images/' + req.body.pid + '.jpg');
			//alert("Product removed.");
			//res.status(200).json(result).end();
			res.redirect('/admin');
		}
	);
});

module.exports = app;