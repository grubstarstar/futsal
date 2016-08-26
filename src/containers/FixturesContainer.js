import { connect } from 'react-redux';
import Fixtures from '../components/Fixtures.jsx';
import populateFixtures from '../actions/Fixtures';

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
		onClickEdit: () => {
			$('#edit-result-dialog').modal('show');
		},
		onClickDelete: () => {
			$('#delete-result-dialog').modal('show');
		},
	};
}

const FixturesContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Fixtures);

export default FixturesContainer;