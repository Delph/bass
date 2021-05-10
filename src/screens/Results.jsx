import React, { useMemo } from 'react';

import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SearchControls from '../components/SearchControls';
import ResultPagination from '../components/ResultPagination';

import { number_format, activated_effect, translate } from '../util';

import style from '../css/screens/Results.module.css';

import defence from '../img/defence.png';
import fire from '../img/elem/fire.png';
import water from '../img/elem/water.png';
import thunder from '../img/elem/thunder.png';
import ice from '../img/elem/ice.png';
import dragon from '../img/elem/dragon.png';

function Row({search, set}) {
  const chosen_effects = useMemo(() => search.effects.map(e => activated_effect(e.skill, e.points)), [search]);

  const extra_skills = Object.keys(set.skills).filter(s => !chosen_effects.includes(activated_effect(s, set.skills[s])));

  const torso_decorations = set.chest_decorations.reduce((a, c) => { a[c.name] = (a[c.name] ?? 0) + 1; return a; }, {});
  const decorations = set.decorations.reduce((a, c) => { a[c.name] = (a[c.name] ?? 0) + 1; return a; }, {});

  return (
    <tr className={style.row}>
      <td className={style.desktop} title={`Effective ${set.eff.raw}`}>{number_format(set.raw.raw)}</td>
      <td className={style.desktop} title={`Effective ${set.eff.fire}`}>{number_format(set.raw.fire)}</td>
      <td className={style.desktop} title={`Effective ${set.eff.water}`}>{number_format(set.raw.water)}</td>
      <td className={style.desktop} title={`Effective ${set.eff.thunder}`}>{number_format(set.raw.thunder)}</td>
      <td className={style.desktop} title={`Effective ${set.eff.ice}`}>{number_format(set.raw.ice)}</td>
      <td className={style.desktop} title={`Effective ${set.eff.dragon}`}>{number_format(set.raw.dragon)}</td>
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
      <td>
        {set.torso_inc ? `Chest: ${Object.keys(torso_decorations).map(d => `${torso_decorations[d]} ${translate('decoration', d)}${(torso_decorations[d] > 1 ? 's' : '')}`).join(', ')}` : ''}<br/>
        {Object.keys(decorations).map(d => `${decorations[d]} ${translate('decoration', d)}${(decorations[d] > 1 ? 's' : '')}`).join(', ')}
      </td>
      <td>{JSON.stringify(set.slots)}</td>
    </tr>
  );
}

function sort(results, order)
{
  return results.sort((a, b) => {
    for (const o of order)
    {
      const keys = o.key.split('.');
      let x = a;
      let y = b;
      for (const key of keys)
      {
        x = x[key];
        y = y[key];
      }
      const cmp = y - x;
      if (cmp !== 0)
        return o.descending === true ? cmp : -cmp;
    }
    return 0;
  });
}

function Results(props) {
  const { search, results, pagination, order, set_order } = props;

  const max = Math.min(pagination.offset + pagination.count, results.length);
  // const show = useMemo(() => results.slice(pagination.offset, max), [pagination, max]);

  const show = sort(results, order).slice(pagination.offset, max);


  // 'sort', 'sort-up', 'sort-down'

  return (
    <div className={style.container}>
      <div className={style.top}>
        <fieldset className={style.search}>
          <legend>Search</legend>
          <div>
            {search.effects.map(e => <div>{translate('effect', activated_effect(e.skill, e.points))}</div>)}
          </div>
          {/*
          <div>
            <div>VR: {search.vr}</div>
            <div>HR: {search.hr}</div>
          </div>
          */}
        </fieldset>
        <SearchControls/>
        <ResultPagination/>
      </div>
      <div className={style.tableContainer}>
        <table className={style.table}>
          <thead>
            <tr>
              <th className={style.head}>
                <img style={{width: 16}} src={defence} alt={'Defence'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.raw') ? (order.find(o => o.key === 'raw.raw').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.raw')}/>
              </th>
              <th className={style.head}>
                <img style={{width: 16}} src={fire} alt={'Fire'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.fire') ? (order.find(o => o.key === 'raw.fire').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.fire')}/>
              </th>
              <th className={style.head}>
                <img style={{width: 16}} src={water} alt={'Water'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.water') ? (order.find(o => o.key === 'raw.water').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.water')}/>
              </th>
              <th className={style.head}>
                <img style={{width: 16}} src={thunder} alt={'Thunder'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.thunder') ? (order.find(o => o.key === 'raw.thunder').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.thunder')}/>
              </th>
              <th className={style.head}>
                <img style={{width: 16}} src={ice} alt={'Ice'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.ice') ? (order.find(o => o.key === 'raw.ice').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.ice')}/>
              </th>
              <th className={style.head}>
                <img style={{width: 16}} src={dragon} alt={'Dragon'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.dragon') ? (order.find(o => o.key === 'raw.dragon').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.dragon')}/>
              </th>
              <th className={style.head}>Equipment</th>
              <th className={style.head}>Extra Skills</th>
              <th className={style.head}>Decorations</th>
              <th className={style.head}>Slots</th>
            </tr>
          </thead>
          <tbody>
          {show.map((r, i) => <Row key={pagination.offset + i} search={search} set={r}/>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function shouldNotRerender(prev, next) {
  if (prev.pagination.count !== next.pagination.count)
    return false;

  if (prev.order !== next.order)
    return false;

  const prev_max = Math.min(prev.pagination.offset + prev.pagination.count, prev.results.length);
  const next_max = Math.min(next.pagination.offset + next.pagination.count, next.results.length);
  return prev_max === next_max;
}

function mapStateToProps(state) {
  return {
    search: state.game[state.game.game].search,
    results: state.game[state.game.game].results.sets,
    pagination: state.game[state.game.game].results.pagination,
    order: state.game[state.game.game].results.order
  };
}

function mapDispatchToProps(dispatch) {
  return {
    set_order: (key, descending) => dispatch({type: 'order', payload: key})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Results, shouldNotRerender));
