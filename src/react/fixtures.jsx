import React from 'react';

var FixturesTableRowDayHeader = React.createClass({
	render: function() {
		return (
			<tr>
				<th className="day-header" colSpan="7">{ this.props.date }</th>
			</tr>
		)
	}
});

var FixturesTableRow = React.createClass({
	componentDidMount: function() {
		// set up the edit result modal dialog for this row
		this.editResultDialog = $('#edit-result-dialog').clone();
		this.editResultDialog.find('input[name="id"]').val(this.props.fixture.id);
		this.editResultForm = this.editResultDialog.find('#edit-result-form');
		this.editResultForm.on('submit', this.putResult);
		// set up the delete result modal dialog for this row
		this.confirmDeleteDialog = $('#delete-result-dialog').clone();
		this.confirmDeleteDialog.find('button#delete-button').on('click', this.deleteResult);
		this.confirmDeleteDialog.find('button#cancel-button').on('click', this.cancelDelete);
	},
	render: function() {
		var buttonClass = this.hasBeenPlayed() ? 'btn btn-sm btn-success' : 'btn btn-sm btn-success disabled';
		var score = this.hasBeenPlayed() ? this.props.fixture.teamA_Goals + " - " + this.props.fixture.teamB_Goals : "vs.";
		var stillToPlay = this.hasBeenPlayed() ? "has-been-played" : "";
		return (
			<tr className={ stillToPlay }>
				<td className="date">{ moment(this.props.fixture.kickOffAt).format('h:mm a') }</td>
				<td className="team-a">{ this.props.fixture.teamA }</td>
				<td className="centered score">{ score }</td>
				<td className="team-b">{ this.props.fixture.teamB }</td>
				<td className="report">{ this.hasBeenPlayed() ? "Full time" : "Still to play" }</td>
				<td className="control-cell"><button className={ buttonClass } onClick={ this.onEdit }><span className="glyphicon glyphicon-flag"></span> Enter result</button></td>
				<td className="control-cell"><button className="btn btn-sm btn-danger" onClick={ this.onDelete }><span className="glyphicon glyphicon-minus-sign"></span> Delete</button></td>
			</tr>
		)
	},
	hasBeenPlayed: function() {
		return moment() > moment(this.props.fixture.kickOffAt).add(90, 'minutes');
	},
	onEdit: function() {
		this.editResultDialog.modal('show');
	},
	putResult: function(event) {

		var btn = $(this.editResultForm).find('button');

		// change the button to display loading...
		btn.button('loading');

		// get the form json into a key: value format
		var data = {};
		$(this.editResultForm).serializeArray().map(function(field) {
			data[field.name] = field.value;
		});

		console.log("PUT JSON", data);
		console.log("PUT JSON", JSON.stringify(data));

		$.ajax({
			url: '/match',
			method: 'PUT',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(data) {
				btn.button('reset');
				this.editResultDialog.modal("hide");
			}.bind(this),
			error: function(error) {
				alert(error);
				btn.button('reset');
				this.editResultDialog.modal("hide");
			}.bind(this)
		});

		event.preventDefault();
	},
	onDelete: function() {
		this.confirmDeleteDialog.modal('show');
	},
	cancelDelete: function() {
		this.confirmDeleteDialog.modal('hide');
	},
	deleteResult: function(event) {

		var id = this.props.fixture.id;

		$.ajax({
			url: '/match/' + id,
			method: 'DELETE',
			success: function(data) {
				this.confirmDeleteDialog.modal("hide");
			}.bind(this),
			error: function(error) {
				alert(error);
				this.confirmDeleteDialog.modal("hide");
			}.bind(this)
		});

		event.preventDefault();
	}		
});

var FixturesTable = React.createClass({

	render: function() {

		// group the fixtures by the day that they are on
		var byDate = _(this.props.fixtures).groupBy(function(fixture) {
				return moment(fixture.kickOffAt).startOf('day').toJSON();
			});

		// put the keys in chronological order
		var orderedDateHeaders = _.chain(byDate)
			.keys().sortBy(function(dtStr) {
				return moment(dtStr).unix();
			})
			.value();

		// create the fixture rows with headers, in the correct order.
		var i = 0;
		var rows = orderedDateHeaders.map(function(fixtureDay) {
			var formatedDate = moment(fixtureDay).format('dddd Do MMMM');
			var fixtureRows = [<FixturesTableRowDayHeader date={ formatedDate } />]
			fixtureRows
				.push(
					_.chain(byDate[fixtureDay])
					.sortBy(function(fixture) {
						return moment(fixture.kickOffAt).unix()
					}).map(function(fixture) {
						return (
							<FixturesTableRow
								key={ i++ }
								fixture={ fixture }
							/>
						);
					})
					.value()
				);
			return fixtureRows;
		});

		// return the wrapping DOM element
		return (
			<div className="fixtures">
				<div className="global-actions">
				<button className="btn btn-sm btn-success" data-toggle="modal" data-target="#add-fixture-dialog"><span className="glyphicon glyphicon-plus-sign"></span> Add fixture</button>
				</div>
				<table>
					<tbody>
						{ rows }
					</tbody>
				</table>
			</div>
		)
	}
});

export default FixturesTable;