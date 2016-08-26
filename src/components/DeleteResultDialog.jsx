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
							<h2>Delete this fixture</h2>
						</div>
						<div className="modal-body">
							<button id="delete-button" className="btn btn-danger">
								{ buttonText }
							</button>
							<button id="cancel-button" className="btn btn-default">
								No
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

});

export default EditResultDialog;