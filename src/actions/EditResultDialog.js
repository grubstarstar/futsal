export const BEGIN_SAVE_EDITED_RESULT = 'BEGIN_SAVE_EDITED_RESULT';
function beginsaveEditedResult() {
	return {
		type: BEGIN_SAVE_EDITED_RESULT
	}
}

export const AFTER_SAVE_EDITED_RESULT = 'AFTER_SAVE_EDITED_RESULT';
function aftersaveEditedResult({ status, data, error }) {
	return {
		type: AFTER_SAVE_EDITED_RESULT,
		status,
		data,
		error
	}
}

function saveEditedResult(fixtureData, next) {
	return dispatch => {
		console.log("PUT: ", JSON.stringify(fixtureData));
		dispatch(beginsaveEditedResult());
		$.ajax({
			url: '/match',
			method: 'PUT',
			contentType: 'application/json',
			dataType: "json",
			data: JSON.stringify(fixtureData),
			success: function(response) {
				console.log('response', response);
				dispatch(aftersaveEditedResult({ status: 'OK', data: response }));
				next();
			},
			error: function(error) {
				console.log('THERE WAS AN ERROR', error);
				dispatch(aftersaveEditedResult({ status: 'ERR', error: error }));
				next(error);
			}.bind(this)
		});
	}
}

export const CHANGE_EDIT_RESULT_DIALOGS_FIXTURE = 'CHANGE_EDIT_RESULT_DIALOGS_FIXTURE';
function changeEditResultDialogsFixture(fixtureId) {
	return {
		type: CHANGE_EDIT_RESULT_DIALOGS_FIXTURE,
		fixtureId
	}
}

export default saveEditedResult;
export { changeEditResultDialogsFixture };

