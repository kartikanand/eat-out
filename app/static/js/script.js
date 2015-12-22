window.onload = function () {
    
    var React = require('react');
    var ReactDom = require('react-dom');
    var q = require('q');

    var RestaurantBox = React.createClass({
        getInitialState: function () {
            return {
                // Initialize restaurant to first restaurant in the array
                restaurant: this.props.restaurantArray[0],
                counter: 0
            };
        },
        nextRestaurant: function () {
            var counter = this.state.counter;

            this.setState({
                restaurant: this.props.restaurantArray[counter+1],
                counter: counter+1
            });
        },
        moreRestaurants: function () {

        },
        render: function () {
            var showRandomButton = true;
            if (this.state.counter == 9) {
                showRandomButton = false;
            }

            var imgStyle = {
                backgroundImage: 'url('+this.state.restaurant.featured_image+')'
            };

            var randomButton = null;
            if (showRandomButton) {
                randomButton = <button onClick={this.nextRestaurant}>Random</button>
            }                

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

    var startProgressbar = function () {
        var wrapper = document.querySelector(".wrapper");
        wrapper.className = wrapper.className + " progress-start";
    };

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

    var renderError = function (err) {
        document.querySelector('.error').innerHTML = err;
    };

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

    var makeRequestToServer = function (options) {
        if (!options) {
            q.reject(new Error());
        }

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
