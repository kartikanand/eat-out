import querystring from 'querystring';
import q from 'q';
import React from 'react';
import RestaurantBox from './RestaurantBox.jsx';

// responsible for getting the current location
// returns a promise
const getLocation = function () {
    const defer = q.defer();

    // check if browser supports html5 location api
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            defer.resolve({
                'lat': lat,
                'lon': lon
            });
        }, function () {
            // user rejected getting current location
            defer.reject(new Error('permission error'));
        });
    } else {
        // browser doesn't support html5 location api
        defer.reject(new Error('location error'));
    }

    return defer.promise;
}

// responsible for making request to server with passed options
// returns a promise
const makeRequestToServer = function (options) {
    // no point in continuing with null options
    if (!options) {
        q.reject(new Error());
    }
    
    const defer = q.defer();

    // do an ajax request to server
    const url = `/search?${querystring.stringify(options)}`;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
        if (xhr.status == 200) {
            defer.resolve(xhr.responseText);
        } else {
            defer.reject(new Error('request error'));
        }
    };
    xhr.send(null);

    return defer.promise;
}

export default class App extends React.Component {
    constructor (props) {
        super(props);

        // start with 0 restaurants
        this.state = {start: 0};
    }

    // responsible for starting the progress bar when user makes a request
    startProgressbar () {
        var wrapper = document.querySelector(".wrapper");
        wrapper.className = wrapper.className + " progress-start";
    }

    // responsible for ending the progress bar after server request is received and first restaurant rendered
    endProgressbar () {
        // This timeout is waiting for the first animation to end
        setTimeout(function () {
            var wrapper = document.querySelector(".wrapper");

            // When the second animation ends, remove the classes
            wrapper.addEventListener('animationend', function (event) {
                wrapper.className = wrapper.className.replace('progress-start', '');
                wrapper.className = wrapper.className.replace('progress-end', '');
            });
            wrapper.className = wrapper.className + " progress-end";

        }, 1000);
    }

    getRestaurants (location) {
        const options = {
            lat: location.lat,
            lon: location.lon,
            start: this.state.start
        };

        console.log("getting restaurants");

        return makeRequestToServer(options)
            .then(JSON.parse);
    }

    // get the next restaurant in array
    nextRestaurant () {
        let counter = this.state.counter;

        this.setState({
            counter: counter+1
        });
    }

    handleLocateMe () {
        this.startProgressbar();

        getLocation()
        .then(location => {
            return this.getRestaurants(location);
        })
        .then(restaurants => {
            this.setState({
                restaurants: restaurants,
                counter: 0
            });
        })
        .catch(err => {
            this.renderError('Oops! We messed up. Please try again.');
        })
        .finally(() => {
            this.endProgressbar();
        });
    }

    render () {
        if (this.state.restaurants) {
            const restaurant = this.state.restaurants[this.state.counter];

            return (
                <RestaurantBox restaurant={restaurant}>
                    <button onClick={this.nextRestaurant.bind(this)}>Random!</button>
                </RestaurantBox>
            );
        } else {
            return <button onClick={this.handleLocateMe.bind(this)}>Locate Me!</button>;
        }
    }
}
