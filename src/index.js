// React and ReactDOM
import React from 'react';
import { render } from 'react-dom';

// Redux, helpers and middleware
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger'

// get combined reducer to pass to the store
import combinedReducer from './reducers';

// get the actions we need
import populateLeagueTable from './actions/LeagueTable';
import populateFixtures from './actions/Fixtures';

// The root App component
import App from './components/App.jsx';

const loggerMiddleware = createLogger();

let store = createStore(
	combinedReducer,
	applyMiddleware(
		loggerMiddleware,
		thunkMiddleware
	)
);

console.log('store.getState()', store.getState());

let unsubscribe = store.subscribe(() => console.log('subscription handler', store.getState()));

$(document).ready(function() {

	store.dispatch(populateLeagueTable());
	store.dispatch(populateFixtures());

	render(
		<Provider store={ store }>
			<App
				table={ [] }
				matches={ [] }
			/>
		</Provider>,
		document.getElementById('appRoot')
	);

});