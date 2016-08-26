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
			? <span><i className="fa fa-refresh fa-spin"></i> Deleting...</span>
			: 'Yes';

		return (
			<div id="delete-result-dialog" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h2>Delete this fixture{ this.props.fixtureId }</h2>
						</div>
						<div className="modal-body">
							<form id="edit-result-form" onSubmit={ this.onSubmit }>
								<input type="hidden" name="id" value={ this.props.fixtureId }/>
								<button id="delete-button" type="submit" className="btn btn-danger">
									{ buttonText }
								</button>
								<button id="cancel-button" className="btn btn-default">
									No
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}

});

export default EditResultDialog;