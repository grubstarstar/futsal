/*
 * action types
 */

export const ADD_FIXTURE_DIALOG_VISIBILITY = 'ADD_FIXTURE_DIALOG_VISIBILITY';
export const EDIT_RESULT_DIALOG_VISIBILITY = 'EDIT_RESULT_DIALOG_VISIBILITY';
export const DELETE_RESULT_DIALOG_VISIBILITY = 'DELETE_RESULT_DIALOG_VISIBILITY';

/*
 * action creators
 */

export function addFixtureDialogVisibility(isVisible) {
	return { type: ADD_FIXTURE_DIALOG_VISIBILITY, isVisible: isVisible };
}

export function editResultDialogVisibility(isVisible) {
	return { type: EDIT_RESULT_DIALOG_VISIBILITY, isVisible: isVisible };
}

export function deleteResultDialogVisibility(isVisible) {
	return { type: DELETE_RESULT_DIALOG_VISIBILITY, isVisible: isVisible };
}