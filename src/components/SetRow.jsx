import React from 'react';

import { connect } from 'react-redux';

import { slots_format, weapon_class, gender, activated_effect, translate } from '../util';

import style from '../css/components/SetRow.module.css';

function SetRow(props) {
  const { set, set_remove, set_move_up, set_move_down } = props;

  return (
    <tr className={style.row}>
      <td>{weapon_class(set.class)}</td>
      <td>{gender(set.gender)}</td>
      <td>{slots_format(set.weapon_slots)}</td>
      <td>{Object.keys(set.skills).map(n => <div>{translate('effect', activated_effect(n, set.skills[n]))}</div>)}</td>
      <td>{set.combination.map(g => <div>{g.name}</div>)}</td>
      <td>
        <input type={'button'} onClick={() => set_move_up(set)} value={'Move Up'}/>
        <input type={'button'} onClick={() => set_move_down(set)} value={'Move Down'}/>
        <input type={'button'} onClick={() => set_remove(set)} value={'Delete'}/>
      </td>
    </tr>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    set_remove: set => dispatch({type: 'set_remove', payload: set}),
    set_move_up: set => dispatch({type: 'set_move_up', payload: set}),
    set_move_down: set => dispatch({type: 'set_move_down', payload: set})
  };
}

export default connect(null, mapDispatchToProps)(SetRow);
