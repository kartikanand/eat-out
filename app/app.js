console.log(process.cwd());
console.log(__dirname);


var express = require('express'),
    app = express();

var zomato = require('./zomato.js');
var zSearch = zomato.search;
 
// Static files
app.use('/static', express.static(__dirname+'/static'));

// Jade configuration
app.set('view engine', 'jade');
app.set('views', __dirname+'/views');

// Listen on port 2000
var server = app.listen(2000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Started server on %s : %s", host, port);
});

app.get('/', function (req, res) {
    // Render index.jade in views directory
    res.render('index');
});

app.get('/search', function (req, res) {
    console.log("Got request");

    var latitude = req.query.lat;
    var longitude = req.query.lon;

    var searchParams = {
        lat: latitude,
        lon: longitude,
        count: 10
    };

    var responseParams = [
        'name', 
        'url', 
        'location', 
        'average_cost_for_two', 
        'currency', 
        'user_rating', 
        'is_delivering_now', 
        'cafe', 
        'phone_numbers',
        'thumb'
    ];

    var responseBody = null;

    zSearch(searchParams, responseParams)
    .then(function (searchResponse) {
        responseBody = searchResponse;
    })
    .catch(function (err) {
        console.log("error")
        console.log(err);
        responseBody = "Error";
    })
    .done(function () {
        console.log("done");
        res.send(JSON.stringify(responseBody));
    });
});