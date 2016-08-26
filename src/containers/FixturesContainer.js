import { connect } from 'react-redux';
import Fixtures from '../components/Fixtures.jsx';
import populateFixtures from '../actions/Fixtures';

const mapStateToProps = (state, ownProps) => {
	return {
		fixtures: state.fixtures.fixtures
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onClickAdd: () => {

		},
		onClickRefresh: () => {
			dispatch(populateFixtures());
		},
		onClickEdit: () => {

		},
		onClickDelete: () => {

		},
	};
}

const FixturesContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Fixtures);

export default FixturesContainer;