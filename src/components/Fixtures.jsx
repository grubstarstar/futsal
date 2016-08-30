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
				<td className="control-cell"><button className={ buttonClass } onClick={ this.props.onClickEdit }><span className="glyphicon glyphicon-flag"></span> Enter result</button></td>
				<td className="control-cell"><button className="btn btn-sm btn-danger" onClick={ this.props.onClickDelete }><span className="glyphicon glyphicon-minus-sign"></span> Delete</button></td>
			</tr>
		)
	},
	hasBeenPlayed: function() {
		return moment() > moment(this.props.fixture.kickOffAt).add(90, 'minutes');
	}
});

var FixturesTable = React.createClass({

	render: function() {

		let self = this;
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
								onClickEdit={ self.props.onClickEdit.bind(self, fixture.id) }
								onClickDelete={ self.props.onClickDelete.bind(self, fixture.id) }
							/>
						);
					})
					.value()
				);
			return fixtureRows;
		});

		// border styling based on if it's fetching data or not
		var borderStyle = this.props.isFetching ? '5px red solid' : 'none';

		// return the wrapping DOM element
		return (
			<div className="fixtures">
				<div className="global-actions">
					<button className="btn btn-sm btn-success" onClick={ this.props.onClickAdd }><span className="glyphicon glyphicon-plus-sign"></span> Add fixture</button>
					<button className="btn btn-sm btn-success" onClick={ this.props.onClickRefresh } style={{ marginLeft: '0.5em' }}><span className="glyphicon glyphicon-refresh"></span> Refresh</button>
				</div>
				<table style={{ border: borderStyle }}>
					<tbody>
						{ rows }
					</tbody>
				</table>
			</div>
		)
	}
});

export default FixturesTable;