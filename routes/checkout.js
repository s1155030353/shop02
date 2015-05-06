var paypal = require('paypal-rest-sdk');
var express = require('express');
var anyDB = require('any-db');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('../shopXX-ierg4210.config.js');
var csp = require('content-security-policy');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
//var csrf = require('csurf');

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1"
};

var globalCSP = csp.getCSP(cspPolicy);

var app = express.Router();

app.use(globalCSP);
//var csrfProtection = csrf({ cookie: true });
//var parseForm = bodyParser.urlencoded({ extended: false });
//app.use(cookieParser());

var pool = anyDB.createPool(config.dbURI, {
  min: 2, max: 10
});

app.use(session({
//  store:new RedisStore({
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
 
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUpHN5mEa9xiMW-BbmYJ2Cyp_vOTRlWH8bPlvdG8zbQ3T6vi9WOsoy5XiXzYCUF9yaQTqVbeLxNRmrqG',
    'client_secret': 'EAEqHFlSEm7r_ztIJD5bvzuxtGonEZ23NxRmwrcgUoB-uZXy_fkurgzwBBswsTSnZM6r8goqtlz4ek4g'
});
 
app.get('/thankyou', function(req, res) {
  // you need to apply some input checks
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    "payer_id" : req.query.PayerID
  };
  //  var token = req.query.token;
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      res.redirect('error').end();
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      if (payment.state == 'approved'){
          console.log("state = " + payment.state);
        pool.query('INSERT INTO payment VALUES (payid, payer_id, "approved", now());', function (error, payment) {
          if (error) {
            console.error(error);
            res.status(500).end();
            return;
          }
        });
          req.session.shoppinglist.destroy();
        res.render('payment-thankyou',{
            layout: "main",
            title: 'IERG4210 Shop02',
            paymentid: paymentId
        });
      }
      else{
        res.redirect('error').end();
      }
      // if payment state is approved
      //   update the payment DB
      //   res.render('payment-thankyou');
      // otherwise
      //   res.redirect('error').end();
      
      res.send('unimplemented').end();
    }
  });
});
 
 
app.get('/error', function(req, res) {
  // you need to apply some input checks
  var token = req.query.token;
  res.render('payment-error', {
      layout: "main",
      title: "IERG4210 shop02"
  });
  // say cancel or error
  // display the url to retry
});
 
// assume this URL will take the request for different pids and qtys
app.post('/', function(req, res) {

    req.session.shoppinglist = req.body.shoppinglist;
//console.log(req.session);
  if (!req.session || typeof req.session.admin == 'undefined'){

    res.redirect('/account/login');
    return;
  }
  //  console.log("hehe");

  // if no login session
  //   save the pids and qtys tentatively
  //   quit and redirect to login page
    var items=[];
    var list=req.session.shoppinglist;
    var length=list.length;
//    console.log(list);
    var total=0;
    pool.query('SELECT * FROM products', function (error, products){
        if (error) {
            console.error(error);
            res.status(500).end();
            return;
        }
//        console.log(products.rows);
//        console.log(list);
        for (var i in products.rows){
            for (var j in list) {
                if (products.rows[i].pid == list[j].pid){
                    console.log("haha");
                    items.push({
                        name : products.rows[i].name,
                        sku : list[j].pid,
                        price : products.rows[i].price,
                        currency : "USD",
                        quantity : list[j].quan
                    });
                    console.log(JSON.stringify(items));
                    total=total+items[i].price*items[i].quantity;
                    console.log(total);
                }
            }
        }

        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                // change the URLs
                //"return_url": "https://store02.ierg4210.org/checkout/thankyou",
                //"cancel_url": "https://store02.ierg4210.org/checkout/error"
                "return_url": "https://www.google.com",
                "cancel_url": "http://www.baidu.com"
            },
            "transactions": [{
                "item_list":
                {
                    // populate the purchased items based on the user-supplied pids and qtys, and other things such as prices and names from DB
                    "items": items
                    /*[{
                     "name": "item name 1",
                     "sku": "PID-1",
                     "price": "1.01",
                     "currency": "USD",
                     "quantity": 1
                     },{
                     "name": "item name 3",
                     "sku": "PID-3",
                     "price": "1.00",
                     "currency": "USD",
                     "quantity": 2
                     }]*/
                },
                "amount": {
                    "currency": "USD",
                    // calculate the correct amount
                    "total": total
                },
                // a good description that you like
                "description": "IERG4210 Shop02"
            }]
        };
        console.log(JSON.stringify(total));
        console.log(create_payment_json);

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.error(JSON.stringify(error));
            }
            else {
                console.log("Created Payment Response");
                console.log(payment);

                // update the payment DB to record the paymentId from paypal
                var link = payment.links;
                for (var i = 0; i < link.length; i++){
                    if (link[i].rel === 'approval_url'){
                        console.log("hehe");
                        res.json(link[i].href);
                    }
                }
                // get the approval_url from payment
                // res.redirect(approval_url);
            }
        });
    });
    //console.log(items);
    /*for (var i=0; i<length; i++){
        (function (i){
            return pool.query('SELECT * FROM products', [list[i].pid], function (error, product) {
                if (error) {
                    console.error(error);
                    res.status(500).end();
                    return;
                }
//                console.log(i);
                items.push({
                    name : product.name,
                    sku : list[i].pid,
                    price : product.price,
                    currency : "USD",
                    quantity : list[i].quan
                });
                total=total+items[i].price*items[i].quantity;
            });
        })(i);
    }*/


});

module.exports = app;