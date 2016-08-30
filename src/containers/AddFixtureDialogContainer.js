import { connect } from 'react-redux';
import AddFixtureDialog from '../components/AddFixtureDialog.jsx';
import saveNewFixture from '../actions/AddFixtureDialog';

const mapStateToProps = (state, ownProps) => {
	return {

	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onSave: (fixtureData, callback) => {
			dispatch(saveNewFixture(fixtureData, callback))
		}
	};
}

const AddFixtureDialogContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(AddFixtureDialog);

export default AddFixtureDialogContainer;