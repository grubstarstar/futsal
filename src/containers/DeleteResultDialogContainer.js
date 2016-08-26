import { connect } from 'react-redux';
import DeleteResultDialog from '../components/DeleteResultDialog.jsx';
import saveResults from '../actions/DeleteResultDialog';

const mapStateToProps = (state, ownProps) => {
	return {
		fixtureId: state.fixtureRelatedDialogs.deleteResultDialogsFixture
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onSave: (fixtureData, callback) => {
			dispatch(saveResults(fixtureData, callback))
		}
	};
}

const DeleteResultDialogContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(DeleteResultDialog);

export default DeleteResultDialogContainer;