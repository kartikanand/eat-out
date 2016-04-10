import React from 'react';
import classNames from 'classnames';

export default function Icon (props) {

    const classes = classNames({
        'icon': true,
        'button-icon': props.btn,
        'food': props.icon == 'spoon-knife',
        'money': props.icon == 'coin-dollar',
        'star': props.icon == 'star-full'
    });

    return (
      <svg viewBox='0 0 16 16' className={classes} >
        <use xlinkHref={`#${props.icon}`} />
      </svg>
    );
};
