import q from 'q';
import React from 'react';
import ReactDOM from 'react-dom';

export default class RestaurantMap extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            center: this.props.center,
            zoom: this.props.zoom
        };
    }

    updateMap () {
        const map = new google.maps.Map(ReactDOM.findDOMNode(this), {
            center: this.state.center,
            zoom: this.state.zoom
        });

        const marker = new google.maps.Marker({
            map: map,
            position: this.state.center,
        });
    }

    // React will keep using the same instance for different restaurants
    // so we call updateMap whenever we recieve new props
    // this will happen on render of a newer restaurant
    componentWillReceiveProps(props) {
        this.setState({
            center: props.center,
            zoom: props.zoom
        });

        this.updateMap();
    }

    // initial render for map
    componentDidMount () {
        this.updateMap();
    }

    // we never need to re-render the div element
    // only call updateMap routine on newer props
    shouldComponentUpdate () {
        return false;
    }

    render () {
        return <div className="res-map"></div>;    
    }
}

export default class RestaurantMapContainer extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            loadingMap: true,
            loadingDistance: true,
            distance: null,
            map: null,
            location: this.props.location,
            currentLocation: this.props.currentLocation
        };
    }

    // Get latitude/longitude information from Google geocoding API
    static getLatLngFromAddress (address) {
        if (!address) {
            q.reject(new Error('invalid address'));
        }

        var defer = q.defer();
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': address}, function (data, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                try {
                    defer.resolve(data[0].geometry.location);
                } catch (e) {
                    defer.reject(e);
                }
            } else {
                defer.reject(new Error('google maps error'));
            }
        });

        return defer.promise;
    }

    // get distance using google javascript Distance Matrix service
    static getDistance (origin, destination) {
        var distanceMatrixService = new google.maps.DistanceMatrixService();

        var defer = q.defer();
        distanceMatrixService.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
        }, function (response, status) {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                try {
                    defer.resolve(response.rows[0].elements[0].distance.text);
                } catch (e) {
                    defer.reject(e);
                }
            } else {
                defer.reject(new Error('distanceMatrixService error'));
            }
        });

        return defer.promise;
    }

    static getLocationGoogleFormat(latitude, longitude) {
        return new google.maps.LatLng(latitude, longitude);
    }

    // get center in googleLatLng format
    static getCenter (latitude, longitude, address) {
        // Zomato doesn't always return location
        if (parseFloat(latitude) && parseFloat(longitude)) {
            return q.resolve(RestaurantMapContainer.getLocationGoogleFormat(latitude, longitude));
        } else {
            return RestaurantMapContainer.getLatLngFromAddress(address);
        }
    }

    renderMap () {
        const latitude = this.state.location.latitude;
        const longitude = this.state.location.longitude;
        const address = this.state.location.address;

        this.constructor.getCenter(latitude, longitude, address)
        .then(data => {
            this.setState({
                center: data,
                loadingMap: false
            });

            return data;
        })
        .then(data => {
            return this.constructor.getDistance(data, this.constructor.getLocationGoogleFormat(this.state.currentLocation.lat, this.state.currentLocation.lon));
        })
        .then(data => {
            this.setState({
                loadingDistance: false,
                distance: data
            });
        })
        .catch(function (err) {
            console.log(err);
        })
        .done();
    }

    getDistanceBox () {
        if (this.state.loadingDistance) return <ul><li>Getting distance!</li></ul>

        return <ul><li>{this.state.distance}</li></ul>
    }

    getMapBox () {
        if (this.state.loadingMap) return <div>Loading Map</div>

        return <RestaurantMap center={this.state.center} zoom={15} />;
    }

    componentDidMount () {
        this.renderMap();
    }

    // React will keep using the same instance for different restaurants
    // so we call renderMap whenever we recieve new props
    // this will happen on render of a newer restaurant
    componentWillReceiveProps(props) {
        // reset map, distance
        // update with new props
        this.setState({
            loadingMap: true,
            loadingDistance: true,
            distance: null,
            map: null,
            location: props.location,
            currentLocation: props.currentLocation
        });

        this.renderMap();
    }

    render () {
        const mapBox = this.getMapBox();
        const distanceBox = this.getDistanceBox();

        return (
            <div>
                {mapBox}
                {distanceBox}
            </div>
        );
    }
}
