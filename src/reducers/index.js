import { combineReducers } from 'redux';

// get the reducers to combine
import leagueTable from './LeagueTable';
import fixtures from './Fixtures';
import dialogs from './Dialogs';

// combine them!
const combinedReducer = combineReducers({
	leagueTable,
	fixtures,
	dialogs
});

export default combinedReducer;