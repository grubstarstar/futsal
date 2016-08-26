import React from 'react';
import ReactDOM from 'react-dom';

const AddFixtureDialog = React.createClass({

	getInitialState() {
		return {
			isSaving: false  
		};
	},

	render() {		
		// decide what should be showing on the submit button
		let buttonText = this.state.isSaving
			? <span><i className="fa fa-refresh fa-spin"></i> Saving...</span>
			: 'Add fixture';

		return (
			<div id="add-fixture-dialog" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
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
		ReactDOM.findDOMNode(self.refs.theDialogBox).modal("show");
	},

	hide() {
		ReactDOM.findDOMNode(self.refs.theDialogBox).modal("hide");
	},

	onSubmit(e) {
		
		let self = this;

		this.setState({

			isSaving: true

		}, () => {

			let form = ReactDOM.findDOMNode(self.refs.theForm);

			// get the form json into a key: value format
			var data = {};
			$(form).serializeArray().map(function(field) {
				data[field.name] = field.value;
			});

			// convert kickOffAt to ISO8601 before it leaves the browser so we know timezone info.
			// moment should do the right thing based on the browser settings.
			data.kickOffAt = moment(new Date(data.kickOffAt)).toJSON();

			// make the request and handle the response
			$.ajax({
				url: '/match',
				method: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(data),
				success: function(data) {
					this.modal("hide");
				},
				error: function(error) {
					alert(error);
					this.modal("hide");
				},
				complete: function() {
					self.setState({
						isSaving: false
					});
				}
			});

		});

		e.preventDefault();
	}

});

export default AddFixtureDialog;