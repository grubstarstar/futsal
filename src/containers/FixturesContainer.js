import { connect } from 'react-redux';
import Fixtures from '../components/Fixtures.jsx';

// import the actions we need
import populateFixtures from '../actions/Fixtures';
import { changeEditResultDialogsFixture } from '../actions/EditResultDialog';
import { changeDeleteDialogsFixture } from '../actions/DeleteResultDialog';

const mapStateToProps = (state, ownProps) => {
	return {
		isFetching: state.fixtures.isFetching,
		fixtures: state.fixtures.fixtures
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onClickAdd: () => {
			$('#add-fixture-dialog').modal('show');
		},
		onClickRefresh: () => {
			dispatch(populateFixtures());
		},
		onClickEdit: (fixtureId) => {
			dispatch(changeEditResultDialogsFixture(fixtureId));
			$('#edit-result-dialog').modal('show');
		},
		onClickDelete: (fixtureId) => {
			dispatch(changeDeleteDialogsFixture(fixtureId));
			$('#delete-result-dialog').modal('show');
		},
	};
}

const FixturesContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Fixtures);

export default FixturesContainer;