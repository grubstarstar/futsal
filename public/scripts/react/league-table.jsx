(function(root) {

	var LeagueTableRowStats = React.createClass({
		render: function() {
			return <tr style={{ background: "#fff" }}>
				<td colSpan="11">
					<svg height="120" width="500">
						
						<line x1="0" y1="0" x2="0" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="70" y1="0" x2="70" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="140" y1="0" x2="140" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="210" y1="0" x2="210" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="280" y1="0" x2="280" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="350" y1="0" x2="350" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="420" y1="0" x2="420" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="490" y1="0" x2="490" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />

						<line x1="0" y1="0" x2="490" y2="0" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="15" x2="490" y2="15" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="30" x2="490" y2="30" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="45" x2="490" y2="45" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="60" x2="490" y2="60" style={{ stroke: "#333", strokeWidth: 1, strokeDasharray: "5,2" }} />
						<line x1="0" y1="75" x2="490" y2="75" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="90" x2="490" y2="90" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="105" x2="490" y2="105" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />
						<line x1="0" y1="120" x2="490" y2="120" style={{ stroke: "#7D7D7D", strokeWidth: 1, strokeDasharray: "2,2" }} />

						<circle cx="0" cy="0" r="4" fill="rgb(235, 95, 95)" />
						<line x1="0" y1="0" x2="70" y2="120" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="70" cy="120" r="4" fill="rgb(235, 95, 95)" />
						<line x1="70" y1="120" x2="140" y2="45" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="140" cy="45" r="4" fill="rgb(235, 95, 95)" />
						<line x1="140" y1="45" x2="210" y2="30" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="210" cy="30" r="4" fill="rgb(235, 95, 95)" />
						<line x1="210" y1="30" x2="280" y2="90" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="280" cy="90" r="4" fill="rgb(235, 95, 95)" />
						<line x1="280" y1="90" x2="350" y2="105" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="350" cy="105" r="4" fill="rgb(235, 95, 95)" />
						<line x1="350" y1="105" x2="420" y2="60" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="420" cy="60" r="4" fill="rgb(235, 95, 95)" />
						<line x1="420" y1="60" x2="490" y2="105" style={{ stroke: "rgb(235, 95, 95)", strokeWidth: 2 }} />
						<circle cx="490" cy="105" r="4" fill="rgb(235, 95, 95)" />
					</svg>
				</td>
			</tr>
		}
	});

	var LeagueTableRow = React.createClass({
		render: function() {
			var arrowClassMap = {
				up: "arrow-up",
				down: "arrow-down",
				stay: "flat"
			};
			return <tr>
				<td className="centered position">
					{ this.props.teamStats.position }
					<div className={ arrowClassMap[this.props.teamStats.moved] } />
				</td>
				<td className="team">{ this.props.teamStats.name }</td>
				<td className="centered played">{ this.props.teamStats.played }</td>
				<td className="centered won">{ this.props.teamStats.won }</td>
				<td className="centered drawn">{ this.props.teamStats.drawn }</td>
				<td className="centered lost">{ this.props.teamStats.lost }</td>
				<td className="centered goals-for">{ this.props.teamStats.goalsFor }</td>
				<td className="centered goals-against">{ this.props.teamStats.goalsAgainst }</td>
				<td className="centered goal-diff">{ this.props.teamStats.goalDiff }</td>
				<td className="centered points">{ this.props.teamStats.points }</td>
				<td className="centered report control-cell"><button onClick={ this.showChart() } className="btn btn-sm btn-success"><span className="glyphicon glyphicon-stats"></span></button></td>
			</tr>
		},
		showChart: function() {

		}
	});

	var LeagueTable = React.createClass({
		render: function() {
			var i = 0;
			return (
				<div className="league-table" >
					<table id="large-league-table">
						<thead>
							<tr>
								<th className="centred">Position</th>
								<th>Team</th>
								<th className="centred">P</th>
								<th className="centred">W</th>
								<th className="centred">D</th>
								<th className="centred">L</th>
								<th className="centred">F</th>
								<th className="centred">A</th>
								<th className="centred">GD</th>
								<th className="centred">Pts</th>
								<th>Stats</th>
							</tr>
						</thead>
						<tbody>
							{ this.getRows() }
						</tbody>
					</table>
				</div>
			);
		},
		getRows: function() {
			var i = 0;
			var rows = this.props.teamsStats.map(function(teamStats) {
				var rv = [];
				rv[0] = <LeagueTableRow
						key={ i++ }
						teamStats={ teamStats }
					/>
				rv[1] = <LeagueTableRowStats
						key={ i++ }
						teamStats={ teamStats }
					/>
				return rv;
			})
			return _.flatten(rows);
		}
	});

	root.LeagueTable = LeagueTable;

})(window);