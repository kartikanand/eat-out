import React from 'react';
import Icon from '../Icon.jsx';

export default function RestaurantDetails (props) {
    return (
        <ul className="res-details">
            <li>
                <Icon icon="star-full" />
                Rating {props.restaurant.user_rating.aggregate_rating}
            </li>
            <li>
                <Icon icon="spoon-knife" />
                {props.restaurant.cuisines}
            </li>
            <li>
                <Icon icon="coin-dollar" />
                {props.restaurant.average_cost_for_two}/- for two
            </li>
        </ul>
    );
}
