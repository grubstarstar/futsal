import Fixtures from './react/fixtures.jsx';
import LeagueTable from './react/league-table.jsx';

console.log('Fixtures', Fixtures);
console.log('LeagueTable', LeagueTable);

_.map([1,2,3,4,5], (i) => console.log(i));

$(document).ready(function() {

	var FixturesTable = window.FixturesTable;
	var LeagueTable = window.LeagueTable;

	$.ajax({
		url: "/table",
		success: function(data) {
			var results = JSON.parse(data);
			ReactDOM.render(
				<LeagueTable teamsStats={ results } />,
				document.getElementById('large-league-table')
			);
			$('[data-toggle="tooltip"]').tooltip();
		}
	});

	$.ajax({
		url: "/match",
		success: function(data) {
			var matches = JSON.parse(data);
			ReactDOM.render(
				<FixturesTable fixtures={ matches }/>,
				document.getElementById('fixtures')
			);					
		}
	});

});