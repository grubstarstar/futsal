import { ADD_FIXTURE_DIALOG_VISIBILITY, EDIT_RESULT_DIALOG_VISIBILITY, DELETE_RESULT_DIALOG_VISIBILITY } from '../actions/Dialogs';

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

export default dialogVisibility;