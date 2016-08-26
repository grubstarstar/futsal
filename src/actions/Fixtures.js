const REQUEST_FIXTURES = 'REQUEST_FIXTURES';
function requestLeagueTable() {
	return {
		type: REQUEST_FIXTURES
	}
}

const RECEIVE_FIXTURES = 'RECEIVE_FIXTURES';
function receiveLeagueTable(fixtureData) {
	return {
		type: RECEIVE_FIXTURES,
		fixtures: fixtureData
	}
}

function populateFixtures() {
	return dispatch => {
		dispatch(requestLeagueTable());
		$.ajax({
			url: "/match",
			success: function(data) {
				var fixturesData = JSON.parse(data);
				dispatch(receiveLeagueTable(fixturesData));
			}
		});
	}
}

export default populateFixtures;
export { REQUEST_FIXTURES, RECEIVE_FIXTURES };