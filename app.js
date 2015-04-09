var express = require('express'),
    exphbs  = require('express-handlebars'),

    // TODO: the file below is not included in the sample code
    frontEndRouter = require('./routes/frontend.js'),
    backEndRouter = require('./routes/backend.js'),
    backEndAPIRouter = require('./routes/backend.api.js'),
    loginRouter = require('./routes/login.js'),
    loginvalidateRouter = require('./routes/login.validate.js'),
    logoutRouter = require('./routes/logout.js'),
    csp = require('content-security-policy');

var app = express();

var cspPolicy = {
    'Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-Content-Security-Policy': "default-src 'self' 127.0.0.1",
    'X-WebKit-CSP': "default-src 'self' 127.0.0.1",
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
app.use('/admin/api', backEndAPIRouter);
app.use('/admin', backEndRouter);
app.use('/admin/login', loginRouter);
app.use('/admin/logout', logoutRouter);
app.use('/admin/login/validate', loginvalidateRouter);
// TODO: shift your routes into ./routes/frontend.js
app.use('/', frontEndRouter);

app.listen(process.env.PORT || 3000, function () {
    console.log('Example Server listening at port ' + (process.env.PORT || 3000));
});