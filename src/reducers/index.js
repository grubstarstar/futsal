import {
	ADD_FIXTURE_DIALOG_VISIBILITY,
	EDIT_RESULT_DIALOG_VISIBILITY,
	DELETE_RESULT_DIALOG_VISIBILITY,
	POPULATE_LEAGUE_TABLE,
	POPULATE_FIXTURES
} from '../actions'

function dialogVisibility(state = { addFixtureDialog: false, editResultDialog: false, deleteResultDialog: false }, action) {
	switch(action.type) {
		case ADD_FIXTURE_DIALOG_VISIBILITY:
			return Object.assign({}, state, { addFixtureDialog: action.isVisible });
		case EDIT_RESULT_DIALOG_VISIBILITY:
			return Object.assign({}, state, { editResultDialog: action.isVisible });
		case DELETE_RESULT_DIALOG_VISIBILITY:
			return Object.assign({}, state, { deleteResultDialog: action.isVisible });
		default:
			return state;
	}
}

function leagueTable(state = [], action) {
	switch(action.type) {
		case POPULATE_LEAGUE_TABLE:
			return action.teamStats;
		default:
			return state;
	}
}

function fixtures(state = [], action) {
	switch(action.type) {
		case POPULATE_FIXTURES:
			return action.fixtures;
		default:
			return state;
	}
}

export { dialogVisibility, leagueTable, fixtures };