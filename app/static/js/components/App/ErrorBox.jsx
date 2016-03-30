import React from 'react';

export default function ErrorBox (props) {
    return (
        <div className="error center-block">{props.errorMsg}</div>
    );
}
