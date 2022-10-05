import React from './vendor/react';
import ReactDOM from './vendor/react-dom';
import './styles/index.css';
import App from './js/App';
import * as serviceWorker from './js/serviceWorker';

ReactDOM.render( < App / > , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();