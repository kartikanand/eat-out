import React from 'react';

export default function RestaurantDetails (props) {
    return (
        <ul className="res-details">
            <li>{props.restaurant.user_rating.aggregate_rating}</li>
            <li>{props.restaurant.cuisines}</li>
            <li>{props.restaurant.average_cost_for_two}/-</li>
        </ul>
    );
}
