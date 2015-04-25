var paypal = require('paypal-rest-sdk');
var express = require('express');
var anyDB = require('any-db');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('../shopXX-ierg4210.config.js');
var csp = require('content-security-policy');
var session = require('express-session');
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

var pool = anyDB.createPool(config.dbURI, {
  min: 2, max: 10
});

app.use(session({
  name: 'login',
  secret: '04n4MY7jLXKlz3y17YdoSOR9o71gvH3R',
  resave: false,
  saveUninitialized: false,
  cookie: { path: '/account', maxAge: 1000*60*60*24*3, httpOnly: true }
  })
);
 
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUpHN5mEa9xiMW-BbmYJ2Cyp_vOTRlWH8bPlvdG8zbQ3T6vi9WOsoy5XiXzYCUF9yaQTqVbeLxNRmrqG',
    'client_secret': 'EAEqHFlSEm7r_ztIJD5bvzuxtGonEZ23NxRmwrcgUoB-uZXy_fkurgzwBBswsTSnZM6r8goqtlz4ek4g'
});
 
app.get('/checkout/thankyou', function(req, res) {
  // you need to apply some input checks
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    "payer_id" : req.query.PayerID
  };
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      res.redirect('error').end();
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      if (payment.state == 'proved'){
        pool.query('INSERT VALUES INTO payment', function (error, payment) {
          if (error) {
            console.error(error);
            res.status(500).end();
            return;
          }
        });
        res.render('payment-thankyou');
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
 
 
app.get('/checkout/error', function(req, res) {
  // you need to apply some input checks
  var token = req.query.token;
  res.render('payment-eror');
  // say cancel or error
  // display the url to retry
});
 
// assume this URL will take the request for different pids and qtys
app.get('/checkout', function(req, res) {
  if (!req.session){
    res.redirect('/account/login');
    return;
  }

  // if no login session
  //   save the pids and qtys tentatively
  //   quit and redirect to login page
  
  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      // change the URLs
      "return_url": "https://store02.ierg4210.org/checkout/thankyou",
      "cancel_url": "https://store02.ierg4210.org/checkout/error"
    },
    "transactions": [{
      "item_list": {
        // populate the purchased items based on the user-supplied pids and qtys, and other things such as prices and names from DB
        "items": [{
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
        }]
      },
      "amount": {
        "currency": "USD",
        // calculate the correct amount
        "total": "3.01"
      },
      // a good description that you like
      "description": "IERG4210 Shop02"
    }]
  };
 
  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          console.error(error);
      } 
      else {
          console.log("Created Payment Response");
          console.log(payment);
      
          // update the payment DB to record the paymentId from paypal
          var link = payment.links;
          for (var i = 0; i < link.length; i++){
            if (link[i].rel === 'approval_url'){
              res.redirect(link[i].href);
            }
          }
          // get the approval_url from payment
          // res.redirect(approval_url);
      }
  });
});

module.exports = app;