var React = require('react');
var ReactDom = require('react-dom');

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
    render: function () {
        return (
            <div className="res-wrapper">
                <h3><a href={this.state.restaurant.url}>{this.state.restaurant.name}</a></h3>

                <div className="res-img">
                    <img src={this.state.restaurant.thumb} />
                </div>

                <div className="res-details">
                    <ul>
                        <li>Rating: 3</li>
                        <li>Chinese, Finger Food</li>
                        <li>1200/-</li>
                    </ul>
                </div>

                <button onClick={this.nextRestaurant}>Random!</button>
            </div>
        );
    }
});


(function (document) {
    
    document.querySelector(".res-wrapper button").addEventListener('click', function (event) {
        event.preventDefault();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;

                var url = '/search?lat='+lat+'&lon='+lon;

                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);

                xhr.onload = function () {
                    if (xhr.status == 200) {
                        try {
                            var restaurantArray = JSON.parse(xhr.responseText);
                            console.log(restaurantArray);

                            ReactDom.render(
                                <RestaurantBox restaurantArray={restaurantArray} />
                                ,document.querySelector(".res-wrapper")
                            );
                        } catch (e) {
                            document.querySelector('.res-wrapper').innerHTML = 'Oops! Some Error occurred';
                        }
                    }
                }

                xhr.send(null);

            }, function () {
                document.querySelector('.res-wrapper').innerHTML = "Please allow to get location"
            });
        } else {
            document.querySelector('.res-wrapper').innerHTML = "Location services not supported. Please get a better browser"
        }

    });



}(document));
