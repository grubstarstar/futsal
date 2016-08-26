import { REQUEST_FIXTURES, RECEIVE_FIXTURES } from '../actions/Fixtures';
import { BEGIN_SAVE_NEW_FIXTURE, AFTER_SAVE_NEW_FIXTURE } from '../actions/AddFixtureDialog';

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
		case AFTER_SAVE_NEW_FIXTURE:
			return Object.assign({}, state, { fixtures: saveNewFixture(state.fixtures, action) });
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

function saveNewFixture(state = [], action) {
	switch(action.type) {
		case BEGIN_SAVE_NEW_FIXTURE:
		case AFTER_SAVE_NEW_FIXTURE:
			if(action.error) {
				return state;
			} else if(action.data) {
				return [...state, action.data];				
			} else {
				throw new Error('The action payload for AFTER_SAVE_NEW_FIXTURE is invalid');
			}
		default:
			return state;
	}
}

export default fixtures;