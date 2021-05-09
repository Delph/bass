import React from 'react';

import { connect } from 'react-redux';

import HistoryEntry from '../components/HistoryEntry';

import style from '../css/screens/History.module.css';

function History(props) {
  const { history } = props;

  return (
    <React.Fragment>
      <table className={style.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Class</th>
            <th>Weapon slots</th>
            <th>HR</th>
            <th>Village</th>
            <th>Gender</th>
            <th>Effects</th>
            <th>Options</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, i) => <HistoryEntry entry={entry} key={i} id={i}/>)}
        </tbody>
      </table>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  return {
    history: state.history,
  };
}

function mapDispatchToProps(state) {
  return {

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(History);
