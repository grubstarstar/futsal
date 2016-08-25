import React from 'react';

const EditResultDialog = React.createClass({

	getInitialState() {
		return {
			isSaving: false  
		};
	},

	render() {		
		// decide what should be showing on the submit button
		let buttonText = this.state.isSaving
			? <span><i className="fa fa-refresh fa-spin"></i> Saving...</span>
			: 'Submit score';

		return (
			<div id="edit-result-dialog" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h2>Edit the result</h2>
						</div>
						<div className="modal-body">
							<form id="edit-result-form" onSubmit={ this.onSubmit }>
								<input type="hidden" name="id" />		
								<div className="form-group">
									<label htmlFor="team-a-score">Team A score</label>
									<input name="teamA_Goals" type="text" id="team-a-score" className="form-control" placeholder="Team A Score" />
								</div>
								<div className="form-group">
									<label htmlFor="team-b-score">Team B score</label>
									<input name="teamB_Goals" type="text" id="team-b-score" className="form-control" placeholder="Team B Score" />
								</div>
								<div className="form-group">
									<button ref="submitButton" type="submit" className="btn btn-default">
										{ buttonText }
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	},

	onSubmit(e) {
		e.preventDefault();
	}

});

export default EditResultDialog;