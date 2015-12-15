// Check if ZOMATO_KEY is set
// without user_key (set as ZOMATO_KEY environment variable) zomato would not accept any requests
// no point in continuing without it
if (!process.env.ZOMATO_KEY) {
    throw new Error('ZOMATO_KEY not set');
}

var express = require('express'),
    app = express(),
    zomato = require('./zomato.js');
 
// Static files
app.use('/static', express.static(__dirname+'/static'));

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

    // Clients should not send empty latitude and/or longitude
    if (!latitude || !longitude) {
        console.log('inside here');
        res.sendStatus(400).send('');
    }

    zomato.getNearbyRestaurants(latitude, longitude)
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

// Listen on port 2000
var server = app.listen(2000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Started server on %s : %s", host, port);
});
