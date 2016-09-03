import React from 'react';
import ReactDOM from 'react-dom';

const AddFixtureDialog = React.createClass({

	getInitialState() {
		return {
			isSaving: false,
			errorMessage: null,
			showSuccessMessage: false
		};
	},

	componentDidMount() {
	    $('#fixture-date').datetimepicker();  
	},

	render() {		
		// decide what should be showing on the submit button
		let buttonText = this.state.isSaving
			? <span><i className="fa fa-refresh fa-spin"></i> Saving...</span>
			: 'Add fixture';

		let errorComponent = this.state.errorMessage
			? <div className="error-panel">{ this.state.errorMessage }</div>
			: <div></div>

		let successComponent = this.state.showSuccessMessage
			? <div className="success-panel">Data saved successfully!</div>
			: <div></div>

		return (
			<div ref="theDialogBox" id="add-fixture-dialog" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						{ errorComponent }
						{ successComponent }
						<div className="modal-header">
							<h2>Add a new fixture</h2>
						</div>
						<div className="modal-body">
							<form ref="theForm" id="new-fixture-form" onSubmit={ this.onSubmit }>
								<div className="form-group">
									<label htmlFor="team-a-name">Team A</label>
									<input name="teamA" type="text" id="team-a-name" className="form-control" placeholder="Team A Name" />
								</div>
								<div className="form-group">
									<label htmlFor="team-b-name">Team B</label>
									<input name="teamB" type="text" id="team-b-name" className="form-control" placeholder="Team B Name" />
								</div>
								<div className="form-group">
									<label htmlFor="fixture-date">Kick off @</label>
									<div className='input-group' id='fixture-date'>
										<input name="kickOffAt" type='text' className="form-control" />
										<span className="input-group-addon">
											<span className="glyphicon glyphicon-calendar"></span>
										</span>
									</div>
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

	show() {
		$(ReactDOM.findDOMNode(this.refs.theDialogBox)).modal("show");
	},

	hide() {
		$(ReactDOM.findDOMNode(this.refs.theDialogBox)).modal("hide");
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

			// convert kickOffAt to ISO8601 before it leaves the browser so we know timezone info.
			// moment should do the right thing based on the browser settings.
			fixtureData.kickOffAt = moment(new Date(fixtureData.kickOffAt)).toJSON();

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
							this.hide();
							this.setState({ errorMessage: null });
						}, 500);
					} else {
						setTimeout(() => {
							this.hide();
							this.setState({ showSuccessMessage: false });
						}, 500);
					}
				}
			);

		});

		e.preventDefault();
	}

});

export default AddFixtureDialog;