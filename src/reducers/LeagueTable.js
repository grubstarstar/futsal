import { REQUEST_LEAGUE_TABLE, RECEIVE_LEAGUE_TABLE } from '../actions/LeagueTable';

function leagueTable(state = {
	isFetching: false,
	table: []
}, action) {
	switch(action.type) {
		case REQUEST_LEAGUE_TABLE:
			return Object.assign({}, state, { isFetching: true });
		case RECEIVE_LEAGUE_TABLE:
			return {
				isFetching: false,
				table: leagueTablePopulate(state.table, action)
			};
		default:
			return state;
	}
}

function leagueTablePopulate(state = [], action) {
	switch(action.type) {
		case RECEIVE_LEAGUE_TABLE:
			return action.table;
		default:
			return state;
	}
}

export default leagueTable;