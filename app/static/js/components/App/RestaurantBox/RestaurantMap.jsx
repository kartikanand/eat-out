import q from 'q';
import React from 'react';
import ReactDOM from 'react-dom';

export default class RestaurantMap extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            zoom: this.props.zoom,
            location: this.props.location
        };
    }

    getLatLng () {
        const address = this.state.location.address;
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

    getCenter () {
        // Zomato doesn't always return location
        if (parseFloat(this.state.location.latitude) && parseFloat(this.state.location.longitude)) {
            return q.resolve(new google.maps.LatLng(this.state.location.latitude, this.state.location.longitude));
        } else {
            return this.getLatLng();
        }
    }

    updateMap () {
        this.getCenter()
        .then( (data) => {
            const map = new google.maps.Map(ReactDOM.findDOMNode(this), {
                center: data,
                zoom: this.state.zoom
            });

            this.setState({
                map: map
            });
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
