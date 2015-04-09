var paypal = require('paypal-rest-sdk');
 
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUHU3rEmdnduhJ2imK4XsVV3NaNpRqqAZrUzl3vgXeBMnriivdIIUJqVCwPI50ItM-V_dvBVmj0_quLG',
    'client_secret': 'ED6TKYUbhOADfnBHW0HOQpvsJju0tY4zW0lJ3x1trJtt3SAaG-G-MGh93sraOtutJL-PX5bseqZ_NPrY'
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
  // say cancel or error
  // display the url to retry
});
 
// assume this URL will take the request for different pids and qtys
app.get('/checkout', function(req, res) {
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
      "return_url": "http://example.com/checkout/thankyou",
      "cancel_url": "http://example.com/checkout/error"
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
      "description": "IERG4210 ShopXX"
    }]
  };
 
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      console.error(error);
    } else {
      console.log("Created Payment Response");
      console.log(payment);
      
      // update the payment DB to record the paymentId from paypal
      
      // get the approval_url from payment
      // res.redirect(approval_url);
    }
  });
});