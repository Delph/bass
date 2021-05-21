import React from 'react';

import { connect } from 'react-redux';

import SetRow from '../components/SetRow';

import style from '../css/screens/Sets.module.css';

function Sets(props) {
  const { sets } = props;

  return (
    <React.Fragment>
      <table className={style.sets}>
        <thead>
          <tr>
            <th>Class</th>
            <th>Gender</th>
            <th>Weapon Slots</th>
            <th>Effects</th>
            <th>Equipment</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sets.map(set => <SetRow set={set}/>)}
        </tbody>
      </table>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  return {
    sets: state.game[state.game.game].sets
  };
}

export default connect(mapStateToProps)(Sets);
