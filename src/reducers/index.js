import { combineReducers } from 'redux';

// get the reducers to combine
import leagueTable from './LeagueTable';
import fixtures from './Fixtures';
import { fixtureRelatedDialogs } from './Fixtures';

// combine them!
const combinedReducer = combineReducers({
	leagueTable,
	fixtures,
	fixtureRelatedDialogs
});

export default combinedReducer;