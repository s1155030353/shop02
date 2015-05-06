var express = require('express'),
    exphbs  = require('express-handlebars'),

    // TODO: the file below is not included in the sample code
    frontEndRouter = require('./routes/frontend.js'),
    backEndRouter = require('./routes/backend.js'),
    backEndAPIRouter = require('./routes/backend.api.js'),
    adminloginRouter = require('./routes/adminlogin.js'),
    adminloginvalidateRouter = require('./routes/adminlogin.validate.js'),
    logoutRouter = require('./routes/logout.js'),
    accountRouter = require('./routes/account.js'),
    userloginRouter = require('./routes/userlogin.js'),
    userloginvalidateRouter = require('./routes/userlogin.validate.js'),
    checkoutRouter = require('./routes/checkout.js'),
    databaseRouter = require('./routes/database.js'),
    csp = require('content-security-policy');

var app = express();

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1"
};

var globalCSP = csp.getCSP(cspPolicy);
app.use(globalCSP);

// TODO: the default layout is not included in the sample code
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// TODO: serve static files from the public folder
app.use(express.static('public'));



/*
app.get('/', function (req, res) {
//        res.redirect('main.html')
        res.render('main')
})

app.get('/main.html', function (req, res) {
        res.render('main')
})

app.get('/game.html', function(req, res) {
        res.render('game');
});

app.get('/video.html', function(req, res) {
        res.render('video');
});

app.get('/music.html', function(req, res) {
        res.render('music');
});

app.get("/product/:who", function(req, res) {
        res.render('product/' + req.params.who);
});
*/



// backend routers run first
app.use('/', frontEndRouter);
app.use('/account', accountRouter);
app.use('/admin', backEndRouter/*, function(req ,res, next){
    var schema = req.headers['x-forwarded-proto'];
    if (schema === 'https') {
// Already https; don't do anything special.
        next();
    }
    else {
// Redirect to https.
        res.redirect('https://' + req.headers.host + req.url + '/admin');
    }
}*/);
app.use('/admin/login', adminloginRouter);
app.use('/admin/logout', logoutRouter);
app.use('/admin/login/validate', adminloginvalidateRouter);
app.use('/admin/api', backEndAPIRouter);
app.use('/database', databaseRouter);
app.use('/account/login', userloginRouter);
app.use('/account/login/validate', userloginvalidateRouter);
// TODO: shift your routes into ./routes/frontend.js
app.use('/checkout', checkoutRouter);



app.listen(process.env.PORT || 3000, function () {
    console.log('Example Server listening at port ' + (process.env.PORT || 3000));
});