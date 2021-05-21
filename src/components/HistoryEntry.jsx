import React from 'react';

import { connect } from 'react-redux';

import { useHistory } from 'react-router-dom';

import { slots_format, translate, activated_effect } from '../util';

import { game } from '../gamedata';

import style from '../css/components/HistoryEntry.module.css';

function HistoryEntry(props) {
  const { entry, remove_history } = props;

  const history = useHistory();

  const start = (props) => {
    props.clear(); // clear result state
    props.worker({type: 'start', payload: props.entry});
    props.add_history(props.entry);
    history.push('/results');
  };

  return (
    <tr className={style.row}>
      <td>{(new Date(entry.timestamp)).toLocaleDateString()}</td>
      <td>{entry.class === 1 ? 'Blademaster' : 'Gunner'}</td>
      <td>{slots_format(entry.slots)}</td>
      <td>{game().vr_format(entry.vr)}</td>
      <td>{game().hr_format(entry.hr)}</td>
      <td>{entry.gender === 1 ? 'Male' : 'Female'}</td>
      <td>
        <ul>
          {entry.effects?.map(effect => (<li>{translate('effect', activated_effect(effect.skill, effect.points))}</li>))}
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
        <input type={'button'} value={'Remove'} onClick={() => remove_history(entry)}/>
      </td>
    </tr>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    clear: () => dispatch({type: 'clear'}),
    worker: payload => dispatch({type: 'worker', payload}),
    add_history: entry => dispatch({type: 'add_history', payload: entry}),
    remove_history: entry => dispatch({type: 'remove_history', payload: entry})
  };
}

export default connect(null, mapDispatchToProps)(HistoryEntry);
