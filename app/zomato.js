var q = require('q');
var request = require('request');
var qs = require('querystring');

/*
    Core api which makes a request to zomato "search" api
    
    Return value:
        Promise object
*/
module.exports.searchRestaurantsOnZomato = function (requestParams) {
    // Check if ZOMATO_KEY is set
    // without user_key (set as ZOMATO_KEY environment variable) zomato would not accept any requests
    // no point in continuing without it
    if (!process.env.ZOMATO_KEY) {
        q.reject(new Error('ZOMATO_KEY not set'));
    }

    // Empty latitude and longitude not expected by zomato api
    if (!requestParams.lat || !requestParams.lon) {
        q.reject(new Error('empty latitude and longitude'));
    }

    // zomato api configuration
    var url = 'https://developers.zomato.com/api/v2.1/search?',
        headers = {
            Accept: 'application/json',
            user_key: process.env.ZOMATO_KEY
        };

    var requestOptions = {
        url: url+qs.stringify(requestParams),
        headers: headers
    };

    // we're returning a promise
    var defer = q.defer();
    request(requestOptions, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            defer.resolve(body);
        } else {
            defer.reject(new Error('request error'));
        }
    });

    return defer.promise;
};

/*
    Filters json data on the basis of responseParams

    Return Value:
        Result array
*/
module.exports.filterRestaurants = function (jsonData, responseParams) {
    // zomato api json result contains restaurants key as array of restaurants
    if (!('restaurants' in jsonData)) {
        throw new Error('restaurants not in jsonData');
    }
    var restaurantArray = jsonData.restaurants,
        resultArray = [];

    // each element of array is a dict
    restaurantArray.forEach(function (dict) {
        
        // each dict is expected to contain a restaurant
        if (!('restaurant' in dict)) {
            throw new Error('restaurant not in jsonData');
        }

        var restaurant = dict.restaurant,
            result = {};

        // copy only needed data
        responseParams.forEach(function (param) {
            result[param] = restaurant[param];
        });

        resultArray.push(result);
    });

    return resultArray;
};

/*
    Return Value:
        Promise object

    Required searchParams:
        lat: latitude
        lon: longitude

    Optional:
*/
module.exports.getNearbyRestaurants = function (latitude, longitude, start) {
    // since we'll be calling functions inside promise(callbacks)
    // save this for later
    var self = this;

    var requestParams = {
        lat: latitude,
        lon: longitude,
        count: 10,
        start: start
    };

    // Zomato returns a lot of data for each restaurant
    // we're only interested in the following params
    // this would reduce the amount of data sent to client as well
    var responseParams = [
        'name', 
        'url', 
        'location', 
        'average_cost_for_two', 
        'cuisines', 
        'user_rating', 
        'is_delivering_now', 
        'cafe', 
        'phone_numbers',
        'featured_image'
    ];

    return self.searchRestaurantsOnZomato(requestParams)
    .then(function (data) {
        return JSON.parse(data);
    })
    .then(function (jsonData) {
        return self.filterRestaurants(jsonData, responseParams);
    })
    .then(JSON.stringify);
};
