var q = require('q');
var request = require('request');
var qs = require('querystring');

var zomato = {

    /*
        Return Value:
            Promise object

        Required searchParams:
            lat: latitude
            lon: longitude

        Optional:
    */
    search: function (searchParams, responseParams) {

        console.log("inside search zomato");
        console.log(searchParams);

        var latitude = searchParams.lat;
        var longitude = searchParams.lon;

        var requestParams = {
            lat: latitude,
            lon: longitude
        };

        if (searchParams.radius) {
            requestParams.radius = searchParams.radius;
        }

        if (searchParams.count) {
            requestParams.count = searchParams.count;
        }

        var url = 'https://developers.zomato.com/api/v2.1/search?'+qs.stringify(requestParams);

        var requestOptions = {
            url: url,
            headers: {
                Accept: 'application/json',
                user_key: process.env.ZOMATO_KEY
            }
        };

        var defer = q.defer();
        var callback = function (err, response, body) {
            if (!err && response.statusCode == 200) {
                console.log("ok zomato");

                var resultArray = [];
                try {
                    var jsonResponse = JSON.parse(body);
                    var restaurantArray = jsonResponse.restaurants;
                    var resultArray = [];
                    restaurantArray.forEach(function (dict) {
                        var restaurant = dict.restaurant;
                        var result = {};
                        responseParams.forEach(function (param) {
                            result[param] = restaurant[param];
                        });
                        resultArray.push(result);
                    });

                    defer.resolve(resultArray);
                }
                catch (e) {
                    defer.reject(new Error("parse error"));
                }
            } else {
                console.log("error zomato");
                defer.reject(new Error('request error'));
            }
        };

        request(requestOptions, callback);

        return defer.promise;
    }
};

module.exports = zomato;