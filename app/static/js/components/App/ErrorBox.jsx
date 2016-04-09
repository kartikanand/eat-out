import React from 'react';

export default function ErrorBox (props) {
    return (
        <div className="error center-text">{props.errorMsg}</div>
    );
}
