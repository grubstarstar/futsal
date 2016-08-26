const REQUEST_LEAGUE_TABLE = 'REQUEST_LEAGUE_TABLE';
function requestLeagueTable() {
	return {
		type: REQUEST_LEAGUE_TABLE
	}
}

const RECEIVE_LEAGUE_TABLE = 'RECEIVE_LEAGUE_TABLE';
function receiveLeagueTable(tableData) {
	return {
		type: RECEIVE_LEAGUE_TABLE,
		table: tableData
	}
}

function populateLeagueTable() {
	return dispatch => {
		dispatch(requestLeagueTable());
		$.ajax({
			url: "/table",
			success: function(data) {
				var tableData = JSON.parse(data);

				// TODO: this is not idiomatic!
				$('[data-toggle="tooltip"]').tooltip();

				dispatch(receiveLeagueTable(tableData));
			}
		});
	}
}

export default populateLeagueTable;
export { REQUEST_LEAGUE_TABLE, RECEIVE_LEAGUE_TABLE };