import React from 'react';

import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';

import { translate, activated_effect } from '../util';

function HistoryEntry(props) {
  const { entry, id, remove_history } = props;

  const history = useHistory();

  const start = (props) => {
    props.clear(); // clear result state
    props.worker({type: 'start', payload: props.search});
    remove_history(id);
    props.push_history(props.search);
    history.push('/results');
  };

  return (
    <tr>
      <td>{(new Date(entry.timestamp)).toLocaleDateString()}</td>
      <td>{entry.class === 1 ? 'Blademaster' : 'Gunner'}</td>
      <td>{entry.slots}</td>
      <td>{entry.hr}</td>
      <td>{entry.vr}</td>
      <td>{entry.gender === 1 ? 'Male' : 'Female'}</td>
      <td>
        <ul>
          {entry.effects.map(effect => (<li>{translate('effect', activated_effect(effect.skill, effect.points))}</li>))}
        </ul>
      </td>
      <td>
        <ul>
          <li>{entry.allow_bad ? 'Allow Bad Effects' : 'Disallow Bad Effects'}</li>
          <li>{entry.allow_piercings ? 'Allow Piercings' : 'Disallow Piercings'}</li>
          <li>{entry.allow_torsoinc ? 'Allow Torso Inc' : 'Disallow Torso Inc'}</li>
          <li>{entry.allow_dummy ? 'Allow Dummy' : 'Disallow Dummy'}</li>
        </ul>
      </td>
      <td>
        <input type={'button'} value={'Search'} onClick={() => start(props)}/>
        <input type={'button'} value={'Remove'} onClick={() => remove_history(id)}/>
      </td>
    </tr>
  );
}

function mapStateToProps(state) {
  return {
    search: state.search
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clear: () => dispatch({type: 'clear'}),
    worker: payload => dispatch({type: 'worker', payload}),
    push_history: search => dispatch({type: 'push_history', payload: search}),
    remove_history: id => dispatch({type: 'remove_history', payload: id})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryEntry);
