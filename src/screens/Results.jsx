import React, { useMemo } from 'react';

import { connect } from 'react-redux';

import { number_format, activated_effect, translate } from '../util';

import style from '../css/screens/Results.module.css';

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
      <td className={style.mobile}>
        <div>{number_format(set.raw.raw)}</div>
        <div>{number_format(set.raw.fire)}</div>
        <div>{number_format(set.raw.water)}</div>
        <div>{number_format(set.raw.thunder)}</div>
        <div>{number_format(set.raw.ice)}</div>
        <div>{number_format(set.raw.dragon)}</div>
      </td>
      <td className={style.desktop}>{translate('head', set.combination[0].name)}</td>
      <td className={style.desktop}>{translate('body', set.combination[1].name)}</td>
      <td className={style.desktop}>{translate('arms', set.combination[2].name)}</td>
      <td className={style.desktop}>{translate('waist', set.combination[3].name)}</td>
      <td className={style.desktop}>{translate('legs', set.combination[4].name)}</td>
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

function Results(props) {
  const { search, results, pagination, next, prev, count, total } = props;

  const max = Math.min(pagination.offset + pagination.count, results.length);
  return (
    <div className={style.container}>
      <div className={style.top}>
        <fieldset className={style.search}>
          <legend>Search</legend>
          <div>
            {search.effects.map(e => <div>{translate('effect', activated_effect(e.skill, e.points))}</div>)}
          </div>
          <div>
            <div>VR: {search.vr}</div>
            <div>HR: {search.hr}</div>
          </div>
        </fieldset>
        <fieldset>
          <div>
            <input type={'button'} value={'Prev'} onClick={prev} disabled={pagination.offset === 0}/>
            <input type={'button'} value={'Next'} onClick={next} disabled={pagination.offset + 10 >= results.length}/>
          </div>
          <div>Showing {number_format(pagination.offset)} to {number_format(max)} of {number_format(results.length)} results.</div>
          <progress max={total} value={count}/>
        </fieldset>
      </div>
      <div className={style.tableContainer}>
        <table className={style.table}>
          <thead>
            <tr>
              <th className={`${style.head} ${style.desktop}`}>Defence</th>
              <th className={`${style.head} ${style.desktop}`}><img style={{width: 16}} src={fire} alt={'Fire'}/></th>
              <th className={`${style.head} ${style.desktop}`}><img style={{width: 16}} src={water} alt={'Water'}/></th>
              <th className={`${style.head} ${style.desktop}`}><img style={{width: 16}} src={thunder} alt={'Thunder'}/></th>
              <th className={`${style.head} ${style.desktop}`}><img style={{width: 16}} src={ice} alt={'Ice'}/></th>
              <th className={`${style.head} ${style.desktop}`}><img style={{width: 16}} src={dragon} alt={'Dragon'}/></th>
              <th className={`${style.head} ${style.mobile}`}>Defence</th>
              <th className={`${style.head} ${style.desktop}`}>Head</th>
              <th className={`${style.head} ${style.desktop}`}>Torso</th>
              <th className={`${style.head} ${style.desktop}`}>Arms</th>
              <th className={`${style.head} ${style.desktop}`}>Waist</th>
              <th className={`${style.head} ${style.desktop}`}>Legs</th>
              <th className={`${style.head} ${style.mobile}`}>Equipment</th>
              <th className={style.head}>Extra Skills</th>
              <th className={style.head}>Decorations</th>
              <th className={style.head}>Slots</th>
            </tr>
          </thead>
          <tbody>
          {results.slice(pagination.offset, pagination.offset + pagination.count).map((r, i) => <Row key={i} search={search} set={r}/>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function mapStateToProps(state) {
  return {
    search: state.search,
    results: state.results.sets,
    count: state.results.count,
    total: state.results.total,
    pagination: state.results.pagination
  };
}

function mapDispatchToProps(dispatch) {
  return {
    next: () => dispatch({type: 'next'}),
    prev: () => dispatch({type: 'prev'}),
    stop: () => dispatch({type: 'stop'})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Results);
