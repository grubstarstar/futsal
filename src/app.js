import FixturesTable from './react/fixtures.jsx';
import LeagueTable from './react/league-table.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

$(document).ready(function() {

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