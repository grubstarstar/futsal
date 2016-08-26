import React from 'react';
import Fixtures from '../containers/FixturesContainer.js';
import LeagueTable from '../containers/LeagueTableContainer.js';
import AddFixtureDialog from '../containers/AddFixtureDialogContainer.js';
import EditResultDialog from '../containers/EditResultDialogContainer.js';
import DeleteResultDialog from '../containers/DeleteResultDialogContainer.js';

const App = ({ matches, table }) => (

	<div className="container-fluid">

		<div className="row">
			<div className='col-sm-6'>

				<h1>Results &amp; Fixtures</h1>

				<div id="fixtures">
					<Fixtures/>
				</div>
				
			</div>

			<div className='col-sm-6'>
			
				<h1>Table</h1>

				<div id="large-league-table">
					<LeagueTable/>
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