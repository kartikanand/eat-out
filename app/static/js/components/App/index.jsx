import querystring from 'querystring';
import q from 'q';
import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ErrorBox from './ErrorBox.jsx';
import Loader from './Loader.jsx';
import RestaurantBox from './RestaurantBox/index.jsx';
import Icon from './Icon.jsx';

export default class App extends React.Component {
    constructor (props) {
        super(props);

        // start with 0 restaurants
        this.state = {
            start: 0,
            nowShowing: 'init'
        };
    }

    // responsible for getting the current location
    // returns a promise
    static getLocation () {
        const defer = q.defer();

        // check if browser supports html5 location api
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                console.log(lat, lon);

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
    static makeRequestToServer (options) {
        // no point in continuing with null options
        if (!options) {
            q.reject(new Error());
        }
        
        const defer = q.defer();

        // build the url with query params
        const url = `/search?${querystring.stringify(options)}`;

        // do an ajax request to server
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

    // returns a promise of JSON.parsed result from server
    // should contain an array of 10 objects
    getRestaurants (location) {
        const options = {
            lat: location.lat,
            lon: location.lon,
            start: this.state.start
        };

        // this is effectively returning a promise of "then" result
        return this.constructor.makeRequestToServer(options).then(JSON.parse);
    }

    // should rename this function to something more sensible
    // this is actually doing a lot of things
    handleLocateMe (ev) {
        ev.preventDefault();

        this.setState({
            nowShowing: 'loading'
        });

        this.constructor.getLocation()
        .then(location => {
            this.setState({
                currentLocation: location
            });

            return this.getRestaurants(location);
        })
        .then(restaurants => {
            this.setState({
                restaurants: restaurants,
                counter: 0,
                nowShowing: 'display'
            });
        })
        .catch(err => {
            console.log(err);
        })
        .done();
    }

    getLocateButton () {
        return (
            <button className="center-block" onClick={this.handleLocateMe.bind(this)}>
                Locate Me&nbsp;
                <Icon icon="compass" btn={true} />
            </button>
        );
    }

    // get the next restaurant in array
    nextRestaurant () {
        let counter = this.state.counter;

        this.setState({
            counter: counter+1
        });
    }

    getCurrentRestaurant () {
        const restaurant = this.state.restaurants[this.state.counter];

        return restaurant;
    }

    displayrestaurant () {
        const restaurant = this.getCurrentRestaurant();

        // Don't render random button on last restaurant
        const randomButton = this.state.counter < this.state.restaurants.length-1 ? 
            <button className="center-block" onClick={this.nextRestaurant.bind(this)}>
                Random&nbsp;
                <Icon icon="shuffle" btn={true} />
            </button> : null;

        return (
            <div>
                <RestaurantBox restaurant={restaurant} currentLocation={this.state.currentLocation}>
                </RestaurantBox>
                {randomButton}
            </div>
        );
    }

    getNowShowing () {
        switch (this.state.nowShowing) {
            case 'init':
                return this.getLocateButton();
            case 'loading':
                return <Loader />;
            case 'error':
                return <ErrorBox errorMsg={this.state.error} />;
            case 'display':
                return this.displayrestaurant();
            default:
                throw new Error('');
        }
    }

    render () {
        return (
            <div>
                <Header />
                    {this.getNowShowing()}
                <Footer />
            </div>
        );
    }
}
