import { connect } from 'react-redux';
import EditResultDialog from '../components/EditResultDialog.jsx';
import saveEditedResults from '../actions/EditResultDialog';

const mapStateToProps = (state, ownProps) => {
	return {
		fixtureId: state.fixtureRelatedDialogs.editResultDialogsFixture
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onSave: (fixtureData, callback) => {
			console.log('onSave', fixtureData, callback);
			dispatch(saveEditedResults(fixtureData, callback))
		}
	};
}

const EditResultDialogContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(EditResultDialog);

export default EditResultDialogContainer;