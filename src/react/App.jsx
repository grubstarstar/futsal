import React from 'react';
import Fixtures from './Fixtures.jsx';
import LeagueTable from './LeagueTable.jsx';
import AddFixtureDialog from './AddFixtureDialog.jsx';
import EditResultDialog from './EditResultDialog.jsx';
import DeleteResultDialog from './DeleteResultDialog.jsx';

const App = ({ matches, table }) => (

	<div className="container-fluid">

		<div className="row">
			<div className='col-sm-6'>

				<h1>Results &amp; Fixtures</h1>

				<div id="fixtures">
					<Fixtures fixtures={ matches }/>
				</div>
				
			</div>

			<div className='col-sm-6'>
			
				<h1>Table</h1>

				<div id="large-league-table">
					<LeagueTable teamsStats={ table } />
				</div>

			</div>
		</div>

		<div id="add-fixture-modal">
			<AddFixtureDialog/>
		</div>
		<div id="edit-result-modal">
			<EditResultDialog/>
		</div>
		<div id="delete-result-modal">
			<DeleteResultDialog/>
		</div>

	</div>

);

export default App;