import React from 'react';

export default function RestaurantMap (props) {
    console.log(props.restaurant);
    const mapSrc = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBtLSm51i41eraOkNmmcZjF3iLv2dwTE_I&q="+props.restaurant.location.latitude+"+"+props.restaurant.location.longitude;

    console.log(mapSrc);

    return (
        <div>
            <iframe
                className="res-map"
                src={mapSrc}
            >
            </iframe>
        </div>
    );
}
