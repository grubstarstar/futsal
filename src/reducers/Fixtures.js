import { REQUEST_FIXTURES, RECEIVE_FIXTURES } from '../actions/Fixtures';
import { BEGIN_SAVE_NEW_FIXTURE, AFTER_SAVE_NEW_FIXTURE } from '../actions/AddFixtureDialog';
import { CHANGE_EDIT_RESULT_DIALOGS_FIXTURE, BEGIN_SAVE_EDITED_RESULT, AFTER_SAVE_EDITED_RESULT } from '../actions/EditResultDialog';
import { CHANGE_DELETE_DIALOGS_FIXTURE, BEGIN_DELETE_FIXTURE, AFTER_DELETE_FIXTURE } from '../actions/DeleteResultDialog';

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
		case AFTER_SAVE_EDITED_RESULT:
			return Object.assign({}, state, { fixtures: saveEditedResultsFixture(state.fixtures, action) });
		case AFTER_DELETE_FIXTURE:
			return Object.assign({}, state, { fixtures: deleteFixture(state.fixtures, action) });
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

function saveEditedResultsFixture(state = [], action) {
	switch(action.type) {
		case BEGIN_SAVE_EDITED_RESULT:
		case AFTER_SAVE_EDITED_RESULT:
			if(action.error) {
				return state;
			} else if(action.data) {
				let newState = Object.assign({}, state);
				_(newState).map((fixture) => {
					if(fixture.id === action.data.id) {
						fixture.teamA_Goals = action.data.teamA_Goals;
						fixture.teamB_Goals = action.data.teamB_Goals;
					}
				});				
				return newState;
			} else {
				throw new Error('The action payload for AFTER_SAVE_EDITED_RESULT is invalid');
			}
		default:
			return state;
	}
}

function deleteFixture(state = [], action) {
	switch(action.type) {
		case BEGIN_DELETE_FIXTURE:
		case AFTER_DELETE_FIXTURE:
			if(action.error) {
				return state;
			} else if(action.data) {
				return _(state).filter((fixture) => fixture.id !== action.data.id);
			} else {
				throw new Error('The action payload for AFTER_DELETE_FIXTURE is invalid');
			}
		default:
			return state;
	}
}

export function fixtureRelatedDialogs(state = {
	editResultDialogsFixture: null,
	deleteResultDialogsFixture: null
}, action) {
	switch(action.type) {
		case CHANGE_EDIT_RESULT_DIALOGS_FIXTURE:
			return Object.assign({}, state, { editResultDialogsFixture: action.fixtureId });
		case CHANGE_DELETE_DIALOGS_FIXTURE:
			return Object.assign({}, state, { deleteResultDialogsFixture: action.fixtureId });
		default:
			return state;
	}
}

export default fixtures;