import React from 'react';

import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SearchControls from '../components/SearchControls';
import ResultPagination from '../components/ResultPagination';

import { activated_effect, translate } from '../util';
import { game } from '../gamedata';

import style from '../css/screens/Results.module.css';

import defence from '../img/defence.png';
import fire from '../img/elem/fire.png';
import water from '../img/elem/water.png';
import thunder from '../img/elem/thunder.png';
import ice from '../img/elem/ice.png';
import dragon from '../img/elem/dragon.png';

import ResultRow from '../components/ResultRow';

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
            {search.effects.map(e => <div key={e.skill}>{translate('effect', activated_effect(e.skill, e.points))}</div>)}
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
              {game().damage_types.includes('ice') ?
              <th className={style.head}>
                <img style={{width: 16}} src={ice} alt={'Ice'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.ice') ? (order.find(o => o.key === 'raw.ice').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.ice')}/>
              </th>
              :
                null
              }
              <th className={style.head}>
                <img style={{width: 16}} src={dragon} alt={'Dragon'}/>
                <FontAwesomeIcon icon={['fas', order.find(o => o.key === 'raw.dragon') ? (order.find(o => o.key === 'raw.dragon').descending ? 'sort-down' : 'sort-up') : 'sort']} className={style.sort} onClick={() => set_order('raw.dragon')}/>
              </th>
              <th className={style.head}>Equipment</th>
              <th className={style.head}>Extra Skills</th>
              {game().has_decorations ?
                <React.Fragment>
                  <th className={style.head}>Decorations</th>
                  <th className={style.head}>Slots</th>
                </React.Fragment>
              :
                null
              }
              <th></th>
            </tr>
          </thead>
          <tbody>
          {show.map((r, i) => <ResultRow key={pagination.offset + i} set={r}/>)}
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
    results: state.results.sets,
    pagination: state.results.pagination,
    order: state.results.order
  };
}

function mapDispatchToProps(dispatch) {
  return {
    set_order: (key, descending) => dispatch({type: 'order', payload: key})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Results, shouldNotRerender));
