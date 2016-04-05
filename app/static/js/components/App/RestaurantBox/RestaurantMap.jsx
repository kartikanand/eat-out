import q from 'q';
import React from 'react';
import ReactDOM from 'react-dom';

export default class RestaurantMap extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            zoom: this.props.zoom,
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
                defer.resolve(data[0].geometry.location);
            } else {
                defer.reject(new Error('google maps error'));
            }
        });

        return defer.promise;
    }

    static getDistance (origin, destination) {
        var distanceMatrixService = new google.maps.DistanceMatrixService();

        var defer = q.defer();
        distanceMatrixService.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
        }, function (response, status) {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                defer.resolve(response.rows[0].elements[0].distance.text);
            } else {
                defer.reject(new Error('distanceMatrixService error'));
            }
        });

        return defer.promise;
    }

    // get center in googleLatLng format
    static getCenter (latitude, longitude, address) {
        // Zomato doesn't always return location
        if (parseFloat(latitude) && parseFloat(longitude)) {
            return q.resolve(new google.maps.LatLng(latitude, longitude));
        } else {
            return RestaurantMap.getLatLngFromAddress(address);
        }
    }

    static getLocationGoogleFormat(latitude, longitude) {
        return new google.maps.LatLng(latitude, longitude);
    }

    updateMap () {
        const latitude = this.state.location.latitude;
        const longitude = this.state.location.longitude;
        const address = this.state.location.address;

        this.constructor.getCenter(latitude, longitude, address)
        .then(data => {
            const map = new google.maps.Map(ReactDOM.findDOMNode(this), {
                center: data,
                zoom: this.state.zoom
            });

            // save map to state so that we can access it later
            this.setState({
                map: map
            });

            return data;
        })
        .then(data => {
            const marker = new google.maps.Marker({
                map: this.state.map,
                position: data,
            });

            // sadly we cannot get marker from google map :/
            // storing it for future use
            this.setState({
                mapMarker: marker
            });

            return data;
        })
        .then(data => {
            return this.constructor.getDistance(data, this.constructor.getLocationGoogleFormat(this.state.currentLocation.lat, this.state.currentLocation.lon));
        })
        .then(data => {
            this.state.mapMarker.setTitle(data);
        })
        .catch(function (err) {
            console.log(err);
        })
        .done();
    }

    componentWillReceiveProps(props) {
        this.setState({
            zoom: props.zoom,
            location: props.location
        });

        this.updateMap();
    }

    componentDidMount () {
        this.updateMap();
    }

    render () {
        return (
            <div className="res-map"></div>
        );
    }
}
