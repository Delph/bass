import React, { useMemo } from 'react';

import { connect } from 'react-redux';

import { activated_effect, number_format, translate } from '../util';

import { game } from '../gamedata';

import style from '../css/components/ResultRow.module.css';

function ResultRow(props) {
  const { search, set, set_add } = props;

  const chosen_effects = useMemo(() => search.effects.map(e => activated_effect(e.skill, e.points)), [search]);

  const extra_skills = Object.keys(set.skills).filter(s => !chosen_effects.includes(activated_effect(s, set.skills[s])));

  const torso_decorations = set.chest_decorations.reduce((a, c) => { a[c.name] = (a[c.name] ?? 0) + 1; return a; }, {});
  const decorations = set.decorations.reduce((a, c) => { a[c.name] = (a[c.name] ?? 0) + 1; return a; }, {});

  return (
    <tr className={style.row}>
      <td className={style.desktop} title={`Effective ${set.eff.raw}`}>{number_format(set.raw.raw)}</td>
      {game().damage_types.map(r =>
        <td className={style.desktop} title={`Effective ${set.eff[r]}`}>{number_format(set.raw[r])}</td>
      )}
      {/*<td className={style.mobile}>
        <div><img style={{width: 16}} src={defence} alt={'Raw'}/>{number_format(set.raw.raw)}</div>
        <div><img style={{width: 16}} src={fire} alt={'Fire'}/>{number_format(set.raw.fire)}</div>
        <div><img style={{width: 16}} src={water} alt={'Water'}/>{number_format(set.raw.water)}</div>
        <div><img style={{width: 16}} src={thunder} alt={'Thunder'}/>{number_format(set.raw.thunder)}</div>
        <div><img style={{width: 16}} src={ice} alt={'Ice'}/>{number_format(set.raw.ice)}</div>
        <div><img style={{width: 16}} src={dragon} alt={'Dragon'}/>{number_format(set.raw.dragon)}</div>
      </td>*/}
      {/*<td className={style.desktop}>{translate('head', set.combination[0].name)}</td>*/}
      {/*<td className={style.desktop}>{translate('body', set.combination[1].name)}</td>*/}
      {/*<td className={style.desktop}>{translate('arms', set.combination[2].name)}</td>*/}
      {/*<td className={style.desktop}>{translate('waist', set.combination[3].name)}</td>*/}
      {/*<td className={style.desktop}>{translate('legs', set.combination[4].name)}</td>*/}
      <td className={style.mobile}>{set.combination.map(g => <div>{g.name}</div>)}</td>
      <td>
        {extra_skills.map(s => <div key={s} className={set.skills[s] < 0 ? style.bad : style.good}>{translate('effect', activated_effect(s, set.skills[s]))}</div>)}
      </td>
      {game().has_decorations ?
        <React.Fragment>
          <td>
            {set.torso_inc ? `Chest: ${Object.keys(torso_decorations).map(d => `${torso_decorations[d]} ${translate('decoration', d)}${(torso_decorations[d] > 1 ? 's' : '')}`).join(', ')}` : ''}<br/>
            {Object.keys(decorations).map(d => `${decorations[d]} ${translate('decoration', d)}${(decorations[d] > 1 ? 's' : '')}`).join(', ')}
          </td>
          <td>{JSON.stringify(set.slots)}</td>
        </React.Fragment>
      :
        null
      }
      <td><input type={'button'} onClick={() => set_add(set)} value={'Add Set'}/></td>
    </tr>
  );
}

function mapStateToProps(state) {
  return {
    search: state.game[state.game.game].search,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    set_add: set => dispatch({type: 'set_add', payload: set})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultRow);
