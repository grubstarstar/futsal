/*
 * action types
 */

export const ADD_FIXTURE_DIALOG_VISIBILITY = 'ADD_FIXTURE_DIALOG_VISIBILITY';
export const EDIT_RESULT_DIALOG_VISIBILITY = 'EDIT_RESULT_DIALOG_VISIBILITY';
export const DELETE_RESULT_DIALOG_VISIBILITY = 'DELETE_RESULT_DIALOG_VISIBILITY';

export const POPULATE_LEAGUE_TABLE = 'POPULATE_LEAGUE_TABLE';
export const POPULATE_FIXTURES = 'POPULATE_FIXTURES';

/*
 * other constants
 */

// export const VisibilityFilters = {
// 	SHOW_ALL: 'SHOW_ALL',
// 	SHOW_COMPLETED: 'SHOW_COMPLETED',
// 	SHOW_ACTIVE: 'SHOW_ACTIVE'
// }

/*
 * action creators
 */

export function addFixtureDialogVisibility(isVisible) {
	return { type: ADD_FIXTURE_DIALOG_VISIBILITY, isVisible: isVisible };
}

export function populateLeagueTable(teamStats) {
	return { type: POPULATE_LEAGUE_TABLE, teamStats: teamStats };
}

export function populateFixtures(fixtures) {
	return { type: POPULATE_FIXTURES, fixtures: fixtures };
}