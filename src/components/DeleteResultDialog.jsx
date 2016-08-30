import React from 'react';
import ReactDOM from 'react-dom';

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

		let errorComponent = this.state.errorMessage
			? <div className="error-panel">{ this.state.errorMessage }</div>
			: <div></div>

		let successComponent = this.state.showSuccessMessage
			? <div className="success-panel">Data saved successfully!</div>
			: <div></div>

		return (
			<div id="delete-result-dialog" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						{ errorComponent }
						{ successComponent }
						<div className="modal-header">
							<h2>Delete this fixture{ this.props.fixtureId }</h2>
						</div>
						<div className="modal-body">
							<form ref="theForm" id="edit-result-form" onSubmit={ this.onSubmit }>
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
							$('#delete-result-dialog').modal("hide");
							this.setState({ errorMessage: null });
						}, 500);
					} else {
						setTimeout(() => {
							$('#delete-result-dialog').modal("hide");
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