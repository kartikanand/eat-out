window.onload = function () {

    var React = require('react');
    var ReactDom = require('react-dom');
    var q = require('q');

    // This is a react component responsible for displaying restaurant details
    var RestaurantBox = React.createClass({
        // Called at the beginning of react render
        getInitialState: function () {
            return {
                // Initialize restaurant to first restaurant in the array
                restaurant: this.props.restaurantArray[0],
                counter: 0
            };
        },
        // get the next restaurant in array
        nextRestaurant: function () {
            var counter = this.state.counter;

            this.setState({
                restaurant: this.props.restaurantArray[counter+1],
                counter: counter+1
            });
        },
        moreRestaurants: function () {
            // will implement this later
        },
        render: function () {
            // since the server is sending 10 restaurants at a time.
            // disable the random button at the last restaurant
            var randomButton = <button onClick={this.nextRestaurant}>Random</button>;
            if (this.state.counter == 9) {
                randomButton = null;
            }

            // for restaurant photo
            var imgStyle = {
                backgroundImage: 'url('+this.state.restaurant.featured_image+')'
            };

            return (
                <div className="res-wrapper">
                    <div className="float-wrapper center-text">
                        <h3><a href={this.state.restaurant.url}>{this.state.restaurant.name}</a></h3>
                        <div className="res-img" style={imgStyle}></div>

                        <ul className="res-details">
                            <li>Rating: {this.state.restaurant.user_rating.aggregate_rating}</li>
                            <li>{this.state.restaurant.cuisines}</li>
                            <li>Average cost for 2 - Rs {this.state.restaurant.average_cost_for_two}/-</li>
                        </ul>
                    </div>

                    {randomButton}
                </div>
            );
        }
    });

    // top utility which calls the react render function with received data
    var renderRestaurants = function (jsonResponse) {
        try {
            var restaurantArray = JSON.parse(jsonResponse);

            ReactDom.render(
                <RestaurantBox restaurantArray={restaurantArray} />
                ,document.querySelector(".react-root")
            );
        } catch (e) {
            throw new Error('parse error');
        }
    };

    // responsible for making request to server with passed options
    // returns a promise
    var makeRequestToServer = function (options) {
        // no point in continuing with null options
        if (!options) {
            q.reject(new Error());
        }

        // do an ajax request to server
        var url = '/search?lat='+options.lat+'&lon='+options.lon+'&start='+options.start;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        var defer = q.defer();
        xhr.onload = function () {
            if (xhr.status == 200) {
                defer.resolve(xhr.responseText);
            } else {
                defer.reject(new Error('request error'));
            }
        };
        xhr.send(null);

        return defer.promise;
    };

    // responsible for getting the current location
    // return a promise
    var getLocation = function () {
        var defer = q.defer();

        // check if browser supports html5 location api
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;

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
    };

    // responsible for starting the progress bar when user makes a request
    var startProgressbar = function () {
        var wrapper = document.querySelector(".wrapper");
        wrapper.className = wrapper.className + " progress-start";
    };

    // responsible for ending the progress bar after server request is received and first restaurant rendered
    var endProgressbar = function () {
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
    };

    // responsible for displaying any request error
    var renderError = function (err) {
        document.querySelector('.error').innerHTML = err;
    };

    // adds a event handler to main button present on index page
    // this funtion is responsible for doing everything
    document.querySelector(".react-root button").addEventListener('click', function (event) {
        event.preventDefault();
        
        startProgressbar();

        getLocation()
        .then(function (location) {
            return makeRequestToServer(location);
        })
        .then(function (jsonResponse) {
            return renderRestaurants(jsonResponse);
        })
        .catch(function (err) {
            renderError('Oops! We messed up. Please try again.');
        })
        .finally(function () {
            endProgressbar();
        });
    });

};
