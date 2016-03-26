import React from 'react';
import ReactDom from 'react-dom';
import App from './components/App/index.jsx';

window.onload = () => ReactDom.render(<App />, document.getElementById('react-root'));
