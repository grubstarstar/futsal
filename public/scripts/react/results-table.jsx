var ResultsTableRow = React.createClass({
	render: function() {
		return (
			<tr>
				<td className="team-a">{ this.props.teamA.name }</td>
				<td className="score"><span>{ this.props.teamA.score }</span> - <span>{ this.props.teamB.score }</span></td>
				<td className="team-b">{ this.props.teamB.name }</td>
				<td className="report">{ this.props.fullTime }</td>
			</tr>
		)
	}
});

var ResultsTable = React.createClass({
	render: function() {
		var i = 0;
		return (
			<table className="results">
				React.createElement('tbody', null, this.getRows());
				<tbody>
					{ this.getRows() }
				</tbody>
			</table>
		)
	},
	getRows: function() {
		var i = 0;
		return this.props.results.map(function(result) {
			return (
				<ResultsTableRow
					key={ i++ }
					teamA={{ name: result.teamA, score: result.teamA_Goals }}
					teamB={{ name: result.teamB, score: result.teamB_Goals }}
					fullTime={ result.fullTime }
				/>
			);
		});
	}
});