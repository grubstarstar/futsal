import { connect } from 'react-redux';
import DeleteResultDialog from '../components/DeleteResultDialog.jsx';
import deleteFixture from '../actions/DeleteResultDialog';

const mapStateToProps = (state, ownProps) => {
	return {
		fixtureId: state.fixtureRelatedDialogs.deleteResultDialogsFixture
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onSave: (fixtureData, callback) => {
			console.log('onSave', fixtureData, callback);
			dispatch(deleteFixture(fixtureData.id, callback))
		}
	};
}

const DeleteResultDialogContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(DeleteResultDialog);

export default DeleteResultDialogContainer;