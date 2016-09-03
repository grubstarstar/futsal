export const BEGIN_SAVE_NEW_FIXTURE = 'BEGIN_SAVE_NEW_FIXTURE';
function beginSaveNewFixture() {
	return {
		type: BEGIN_SAVE_NEW_FIXTURE
	}
}

export const AFTER_SAVE_NEW_FIXTURE = 'AFTER_SAVE_NEW_FIXTURE';
function afterSaveNewFixture({ status, data, error }) {
	return {
		type: AFTER_SAVE_NEW_FIXTURE,
		status,
		data,
		error
	}
}

function saveNewFixture(fixtureData, next) {
	return dispatch => {
		console.log("IN THE ACTION saveNewFixture(fixtureData, next)", fixtureData, next)
		dispatch(beginSaveNewFixture());
		$.ajax({
			url: '/match',
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(fixtureData),
			success: function(response) {
				dispatch(afterSaveNewFixture({ status: 'OK', data: JSON.parse(response) }));
				next();
			},
			error: function(xhr, status, error) {
				console.log('THERE WAS AN ERROR', error);
				dispatch(afterSaveNewFixture({ status: 'ERR', error: error }));
				next(error);
			}
		});
	}
}

export default saveNewFixture;