import { REQUEST_FIXTURES, RECEIVE_FIXTURES } from '../actions/Fixtures';

function fixtures(state = [], action) {
	switch(action.type) {
		case POPULATE_FIXTURES:
			return action.fixtures;
		default:
			return state;
	}
}
function fixtures(state = {
	isFetching: false,
	fixtures: []
}, action) {
	switch(action.type) {
		case REQUEST_FIXTURES:
			return Object.assign({}, state, { isFetching: true });
		case RECEIVE_FIXTURES:
			return {
				isFetching: false,
				fixtures: fixturesPopulate(state.fixtures, action)
			};
		default:
			return state;
	}
}

function fixturesPopulate(state = [], action) {
	switch(action.type) {
		case RECEIVE_FIXTURES:
			return action.fixtures;
		default:
			return state;
	}
}

export default fixtures;