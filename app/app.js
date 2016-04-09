// Check if ZOMATO_KEY is set
// without user_key (set as ZOMATO_KEY environment variable) zomato would not accept any requests
// no point in continuing without it
if (!process.env.ZOMATO_KEY) {
    throw new Error('ZOMATO_KEY not set');
}

var express = require('express'),
    app = express(),
    zomato = require('./zomato.js');

app.locals.development = process.env.NODE_ENV != 'production';

// Static files configuration
var staticFilesPath = __dirname+'/dev';
if (!app.locals.development) {
    // to use non-minified css and js files
    staticFilesPath = __dirname+'/public';
}
app.use('/static', express.static(staticFilesPath));

// Jade configuration
app.set('view engine', 'jade');
app.set('views', __dirname+'/views');

// Render index.jade in views directory
app.get('/', function (req, res) {
    res.render('index');
});

// Return nearby restaurants based on latitude and longitude
app.get('/search', function (req, res) {
    var latitude = req.query.lat;
    var longitude = req.query.lon;
    var start = req.query.start;

    // start from 0
    // if request comes again, then start from that value
    if (!start) start = 0;

    // Clients should not send empty latitude and/or longitude
    if (!latitude || !longitude) {
        res.sendStatus(400).send('');
    }

    zomato.getNearbyRestaurants(latitude, longitude, start)
    .then(function (searchResponse) {
        console.log('sending response');
        res.status(200).send(searchResponse);
    })
    .catch(function (err) {
        console.log(err);
        res.status(500).send('');
    })
    .done(function () {
        console.log('request successful');
    }, function (err) {
        console.log('request unsuccessful')
        console.log(err);
    });
});

var port = process.env.PORT || 8080;

// Listen on port set by Heroku/8080
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Started server on %s : %s", host, port);
});
