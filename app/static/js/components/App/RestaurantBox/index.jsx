import React from 'react';
import RestaurantMapContainer from './RestaurantMap.jsx';
import RestaurantDetails from './RestaurantDetails.jsx';
import Icon from '../Icon.jsx';

export default function RestaurantBox (props) {
    return (
        <div className="res-wrapper">
            <h3>
                <Icon icon="office" />&nbsp;
                <a className="vm" href={props.restaurant.url}>{props.restaurant.name}</a>
            </h3>

            <RestaurantMapContainer currentLocation={props.currentLocation} location={props.restaurant.location} />
            <RestaurantDetails restaurant={props.restaurant} />
        </div>
    );
}
