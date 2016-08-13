(function(root) {

	var LeagueTableRowStats = React.createClass({
		render: function() {
			var height = 120;
			var leftRightPadding = 15;
			var topBottomPadding = 15;
			var xMultiplier = 70;
			var yMultiplier = 15;
			var gridWidth = ( 7 * xMultiplier ) + leftRightPadding;
			var reversedLastFive = [];
			for(var i = 0; i < this.props.lastFive.length; i++) {
				reversedLastFive[i] = this.props.lastFive[(this.props.lastFive.length - 1) - i];
			}
			return <tr style={{ background: "#fff" }} className="chart">
				<td colSpan="11">
					<svg height="120" width="inherit">
						
						{ [0,1,2,3,4,5,6,7].map(function(num) {
							return <line
								key={ num }
								x1={ (num * xMultiplier) + leftRightPadding }
								y1={ 0 }
								x2={ (num * xMultiplier) + leftRightPadding }
								y2={ height - topBottomPadding }
								style={{ stroke: "#CCC", strokeWidth: "1px", strokeDasharray: "1,1" }}
							/>
							
						})}

						{ [0,1,2,3,4,5,6].map(function(num) {
							return <line
								key={ num }
								x1={ 0 }
								y1={ (num * yMultiplier) + topBottomPadding }
								x2={ gridWidth }
								y2={ (num * yMultiplier) + topBottomPadding }
								style={{ stroke: "#AAA", strokeWidth: "1px", strokeDasharray: "1,1" }}
							/>
							
						})}

						{ reversedLastFive.map(function(matchStats, idx) {
							if(height - topBottomPadding - (matchStats.goalsFor * yMultiplier) < topBottomPadding) {
								var xCenter = gridWidth - (idx * xMultiplier);
								var yCenter = topBottomPadding;
								var vertOffset = 5;
								var triangleSize = 12;
								var points = [{
									x: xCenter - (triangleSize / 2),
									y: yCenter - vertOffset + (triangleSize * 0.866 / 2)
								},{
									x: xCenter,
									y: yCenter - vertOffset - (triangleSize * 0.866 / 2)
								},{
									x: xCenter + (triangleSize / 2),
									y: yCenter - vertOffset + (triangleSize * 0.866 / 2)
								}];
								var pointsStrs = [];
								points.forEach(function(point, idx) {
									pointsStrs[idx] = pointsStrs[idx] || "";
									pointsStrs[idx] += point.x + "," + point.y;
								});
								return <polygon
									points={ pointsStrs.join(" ") }
									style={{ fill: "rgba(22, 195, 235, 0.5)", stroke: "rgb(66, 34, 235)", strokeWidth: 2 }}
								/>
							}
							return <circle
								key={ idx }
								cx={ gridWidth - (idx * xMultiplier) }
								cy={ height - topBottomPadding - (matchStats.goalsFor * yMultiplier) }
								r="6"
								stroke="rgb(66, 34, 235)"
								strokeWidth="2"
								fill="rgba(22, 195, 235, 0.5)"
							/>
						}) }

						{ reversedLastFive.map(function(matchStats, idx) {
							return <circle
								key={ idx }
								cx={ gridWidth - (idx * xMultiplier) }
								cy={ height - topBottomPadding - (matchStats.goalsAgainst * yMultiplier) }
								r="6"
								stroke="rgb(255, 45, 95)"
								strokeWidth="2"
								fill="rgba(235, 95, 95, 0.3)"
							/>
						}) }

					</svg>
				</td>
			</tr>
		},
		toggleShow: function() {
			$(ReactDOM.findDOMNode(this)).toggle();
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
				<td className="centered report control-cell"><button onClick={ this.props.onStatButtonClick } className="btn btn-sm btn-success"><span className="glyphicon glyphicon-stats"></span></button></td>
			</tr>
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
			function toggleChart() {
				console.log('in toggleChart', this);
				console.log(this.refs);
			}
			var i = 0;
			var rows = this.props.teamsStats.map(function(teamStats) {
				var rv = [];
				rv[0] = <LeagueTableRow
						key={ i++ }
						teamStats={ teamStats }
						onStatButtonClick={ this.onStatButtonClick.bind(this, i) }
					/>
				rv[1] = <LeagueTableRowStats
						ref={ 'teamStat' + i }
						key={ i++ }
						lastFive={ teamStats.lastFive }
					/>
				return rv;
			}.bind(this))
			return _.flatten(rows);
		},
		onStatButtonClick: function(relatedTeamStatRowIdx) {
			var key = 'teamStat' + relatedTeamStatRowIdx;
			this.refs[key].toggleShow();
		}
	});

	root.LeagueTable = LeagueTable;

})(window);