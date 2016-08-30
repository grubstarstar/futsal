import React from 'react';
import ReactDOM from 'react-dom';

const EditResultDialog = React.createClass({

	getInitialState() {
		return {
			isSaving: false  
		};
	},

	render() {
		console.log('this.props', this.props);
		// decide what should be showing on the submit button
		let buttonText = this.state.isSaving
			? <span><i className="fa fa-refresh fa-spin"></i> Saving...</span>
			: 'Submit score';

		let errorComponent = this.state.errorMessage
			? <div className="error-panel">{ this.state.errorMessage }</div>
			: <div></div>

		let successComponent = this.state.showSuccessMessage
			? <div className="success-panel">Data saved successfully!</div>
			: <div></div>

		return (
			<div id="edit-result-dialog" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						{ errorComponent }
						{ successComponent }
						<div className="modal-header">
							<h2>Edit the result { this.props.fixtureId }</h2>
						</div>
						<div className="modal-body">
							<form ref="theForm" id="edit-result-form" onSubmit={ this.onSubmit }>
								<input type="hidden" name="id" value={ this.props.fixtureId }/>
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
		
		let self = this;

		// do stuff specific to this React component that isn't application specific
		this.setState({

			isSaving: true

		}, () => {

			let form = ReactDOM.findDOMNode(self.refs.theForm);

			// get the form json into a key: value format
			var fixtureData = {};
			$(form).serializeArray().map(function(field) {
				fixtureData[field.name] = field.value;
			});

			console.log('onSubmit', fixtureData);

			// call the save function that was passed by the caller of this React component
			this.props.onSave(
				fixtureData,
				(errorMessage) => {
					// callback for the caller to call once it's saved
					this.setState({
						isSaving: false,
						errorMessage: errorMessage,
						showSuccessMessage: !errorMessage
					});

					if(errorMessage) {
						setTimeout(() => {
							$('#edit-result-dialog').modal("hide");
							this.setState({ errorMessage: null });
						}, 500);
					} else {
						setTimeout(() => {
							$('#edit-result-dialog').modal("hide");
							this.setState({ showSuccessMessage: false });
						}, 500);
					}
				}
			);

		});

		e.preventDefault();
	}

});

export default EditResultDialog;