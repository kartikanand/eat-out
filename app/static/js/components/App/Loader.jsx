import React from 'react';

export default function Loader (props) {
    return (
        <div className="loader center-block">Loading</div>
    );
}

/*    // responsible for starting the progress bar when user makes a request
    startProgressbar () {
        var wrapper = document.querySelector(".wrapper");
        wrapper.className = wrapper.className + " progress-start";
    }

    // responsible for ending the progress bar after server request is received and first restaurant rendered
    endProgressbar () {
        // This timeout is waiting for the first animation to end
        setTimeout(function () {
            var wrapper = document.querySelector(".wrapper");

            // When the second animation ends, remove the classes
            wrapper.addEventListener('animationend', function (event) {
                wrapper.className = wrapper.className.replace('progress-start', '');
                wrapper.className = wrapper.className.replace('progress-end', '');
            });
            wrapper.className = wrapper.className + " progress-end";

        }, 1000);
    }
*/