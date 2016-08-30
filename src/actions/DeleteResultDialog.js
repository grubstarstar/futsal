export const BEGIN_DELETE_FIXTURE = 'BEGIN_DELETE_FIXTURE';
function beginDeleteFixture() {
	return {
		type: BEGIN_DELETE_FIXTURE
	}
}

export const AFTER_DELETE_FIXTURE = 'AFTER_DELETE_FIXTURE';
function afterDeleteFixture({ status, data, error }) {
	return {
		type: AFTER_DELETE_FIXTURE,
		status,
		data,
		error
	}
}

function deleteFixture(fixtureId, next = () => {}) {
	return dispatch => {
		console.log("DELETE: ", fixtureId);
		dispatch(beginDeleteFixture());

		$.ajax({
			url: '/match/' + fixtureId,
			method: 'DELETE',
			contentType: 'application/json',
			dataType: "json",
			success: function(response) {
				console.log('response', response);
				dispatch(afterDeleteFixture({ status: 'OK', data: response }));
				next();
			},
			error: function(error) {
				console.log('THERE WAS AN ERROR', error);
				dispatch(afterDeleteFixture({ status: 'ERR', error: error }));
				next(error);
			}
		});
	}
}

export const CHANGE_DELETE_DIALOGS_FIXTURE = 'CHANGE_DELETE_DIALOGS_FIXTURE';
function changeDeleteDialogsFixture(fixtureId) {
	return {
		type: CHANGE_DELETE_DIALOGS_FIXTURE,
		fixtureId
	}
}

export default deleteFixture;
export { changeDeleteDialogsFixture };

