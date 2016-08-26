import { connect } from 'react-redux';
import AddFixtureDialog from '../components/AddFixtureDialog.jsx';
import saveNewFixture from '../actions/AddFixtureDialog';

const mapStateToProps = (state, ownProps) => {
	return {
	// 	isFetching: state.fixtures.isFetching,
	// 	fixtures: state.fixtures.fixtures
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onSave: (fixtureData, callback) => {
			console.log('!!!!!!!!!!!calling onSave: fixtureData, callback', fixtureData, callback);
			dispatch(saveNewFixture(fixtureData, callback))
		}
	};
}

const AddFixtureDialogContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(AddFixtureDialog);

export default AddFixtureDialogContainer;