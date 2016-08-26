import { connect } from 'react-redux';
import LeagueTable from '../components/LeagueTable.jsx';
import populateLeagueTable from '../actions/LeagueTable';

const mapStateToProps = (state, ownProps) => {
	return {
		isFetching: state.leagueTable.isFetching,
		teamsStats: state.leagueTable.table
	};
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		onClickRefresh: () => {
			dispatch(populateLeagueTable());
		}
	};
}

const LeagueTableContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(LeagueTable);

export default LeagueTableContainer;