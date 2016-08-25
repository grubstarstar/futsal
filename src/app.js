import React from 'react';
import { render } from 'react-dom';
import { combineReducers, createStore } from 'redux'
import * as reducers from './reducers';
import { addFixtureDialogVisibility, populateLeagueTable, populateFixtures } from './actions';

import App from './react/App.jsx';

const combinedReducer = combineReducers(reducers);

let store = createStore(combinedReducer);

console.log('store.getState()', store.getState());

let unsubscribe = store.subscribe(() => console.log('subscription handler', store.getState()));

store.dispatch(addFixtureDialogVisibility(true));
store.dispatch(populateLeagueTable([{
		"played": 1,
		"won": 0,
		"lost": 1,
		"drawn": 0,
		"goalsFor": 1,
		"goalsAgainst": 2,
		"goalDiff": -1,
		"points": 0,
		"position": 15,
		"lastFive": [
			{
				"goalsFor": 1,
				"goalsAgainst": 2,
				"playingAgainst": "Tottenham",
				"kickOffAt": "2016-08-13T03:15:00.000Z"
			}
		],
		"name": "Manchester United",
		"moved": "stay"
	}]));
store.dispatch(populateFixtures([{
		"id": "57bd85cf652a7566d23125a6",
		"teamA": "ddd",
		"teamA_Goals": "2",
		"teamB": "c",
		"teamB_Goals": "3",
		"kickOffAt": "2016-08-01T14:00:00.000Z"
	},
	{
		"id": "57bd863f652a7566d23125a8",
		"teamA": "ddd",
		"teamA_Goals": "1",
		"teamB": "a",
		"teamB_Goals": "1",
		"kickOffAt": "2016-08-04T14:00:00.000Z"
	}]));

unsubscribe();

$(document).ready(function() {

	// $.ajax({
	// 	url: "/table",

	// 	success: function(data) {
	// 		var table = JSON.parse(data);
	// 		// store.dispatch(POPULATE_LEAGUE_TABLE);

	// 		// TODO: this is not idiomatic!
	// 		$('[data-toggle="tooltip"]').tooltip();
	// 	}
	// });

	// $.ajax({
	// 	url: "/match",
	// 	success: function(data) {
	// 		var matches = JSON.parse(data);
	// 		// store.dispatch(POPULATE_FIXTURES);
	// 	}
	// });

	var table = [{
		"played": 1,
		"won": 0,
		"lost": 1,
		"drawn": 0,
		"goalsFor": 1,
		"goalsAgainst": 2,
		"goalDiff": -1,
		"points": 0,
		"position": 15,
		"lastFive": [
			{
				"goalsFor": 1,
				"goalsAgainst": 2,
				"playingAgainst": "Tottenham",
				"kickOffAt": "2016-08-13T03:15:00.000Z"
			}
		],
		"name": "Manchester United",
		"moved": "stay"
	}];

	let matches = [{
		"id": "57bd85cf652a7566d23125a6",
		"teamA": "ddd",
		"teamA_Goals": "2",
		"teamB": "c",
		"teamB_Goals": "3",
		"kickOffAt": "2016-08-01T14:00:00.000Z"
	},
	{
		"id": "57bd863f652a7566d23125a8",
		"teamA": "ddd",
		"teamA_Goals": "1",
		"teamB": "a",
		"teamB_Goals": "1",
		"kickOffAt": "2016-08-04T14:00:00.000Z"
	}];

	render(
		<App
			table={ table }
			matches={ matches }
		/>,
		document.getElementById('appRoot')
	);

});