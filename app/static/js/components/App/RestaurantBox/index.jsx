import React from 'react';
import RestaurantMapContainer from './RestaurantMap.jsx';
import RestaurantDetails from './RestaurantDetails.jsx';

export default function RestaurantBox (props) {
    return (
        <div className="res-wrapper">
            <div className="">
                <h3><a href={props.restaurant.url}>{props.restaurant.name}</a></h3>

                <RestaurantMapContainer currentLocation={props.currentLocation} location={props.restaurant.location} />
                <RestaurantDetails restaurant={props.restaurant} />
            </div>
            {props.children}
        </div>
    );
}
