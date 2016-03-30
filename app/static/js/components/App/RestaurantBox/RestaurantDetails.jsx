import React from 'react';

export default function RestaurantDetails (props) {
    return (
        <ul className="res-details">
            <li>Rating: {props.restaurant.user_rating.aggregate_rating}</li>
            <li>{props.restaurant.cuisines}</li>
            <li>Average cost for 2 - Rs {props.restaurant.average_cost_for_two}/-</li>
            <li>Distance : {props.restaurant.location.latitude} {props.restaurant.location.longitude}</li>
        </ul>
    );
}
