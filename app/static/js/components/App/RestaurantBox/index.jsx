import React from 'react';
import RestaurantMap from './RestaurantMap.jsx';
import RestaurantDetails from './RestaurantDetails.jsx';

export default function RestaurantBox (props) {
    return (
        <div className="res-wrapper">
            <div className="float-wrapper center-text">
                <h3><a href={props.restaurant.url}>{props.restaurant.name}</a></h3>

                <RestaurantMap currentLocation={props.currentLocation} location={props.restaurant.location} zoom={15} />
                <RestaurantDetails restaurant={props.restaurant} />
            </div>
            {props.children}
        </div>
    );
}
