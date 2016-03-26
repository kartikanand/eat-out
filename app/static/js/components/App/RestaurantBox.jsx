import React from 'react';

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

                <ul className="res-details">
                    <li>Rating: {props.restaurant.user_rating.aggregate_rating}</li>
                    <li>{props.restaurant.cuisines}</li>
                    <li>Average cost for 2 - Rs {props.restaurant.average_cost_for_two}/-</li>
                </ul>
            </div>
            {props.children}
        </div>
    );
}
