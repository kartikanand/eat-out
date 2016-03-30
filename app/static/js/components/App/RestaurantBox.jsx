import React from 'react';
import RestaurantMap from './RestaurantMap.jsx';
import RestaurantDetails from './RestaurantDetails.jsx';

export default function RestaurantBox (props) {
    // for restaurant photo
    const imgStyle = {
        backgroundImage: `url(${props.restaurant.featured_image})`
    };

    return (
        <div className="res-wrapper">
            <div className="float-wrapper center-text">
                <h3><a href={props.restaurant.url}>{props.restaurant.name}</a></h3>
                <div className="res-img" style={imgStyle}></div>

                <RestaurantDetails restaurant={props.restaurant} />
            </div>
            {props.children}
        </div>
    );
}
