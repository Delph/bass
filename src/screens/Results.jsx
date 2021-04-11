import React from 'react';

import { connect } from 'react-redux';

import { number_format } from '../util';

import fire from '../img/elem/fire.png';
import water from '../img/elem/water.png';
import thunder from '../img/elem/thunder.png';
import ice from '../img/elem/ice.png';
import dragon from '../img/elem/dragon.png';

function Row({set}) {
  const torso_inc = set.combination.filter(g => g.torso_inc).length;

  return (
    <tr>
      <td title={`Effective ${set.eff.raw}`}>{number_format(set.raw.raw)}</td>
      <td title={`Effective ${set.eff.fire}`}>{number_format(set.raw.fire)}</td>
      <td title={`Effective ${set.eff.water}`}>{number_format(set.raw.water)}</td>
      <td title={`Effective ${set.eff.thunder}`}>{number_format(set.raw.thunder)}</td>
      <td title={`Effective ${set.eff.ice}`}>{number_format(set.raw.ice)}</td>
      <td title={`Effective ${set.eff.dragon}`}>{number_format(set.raw.dragon)}</td>
      <td>{set.combination[0].name}</td>
      <td>{set.combination[1].name}</td>
      <td>{set.combination[2].name}</td>
      <td>{set.combination[3].name}</td>
      <td>{set.combination[4].name}</td>
      <td>
        {torso_inc ? `Chest: ${set.chest_decorations.map(d => d.name).join(', ')}` : ''}
        {set.decorations.map(d => d.name).join(', ')}
      </td>
      <td></td>
    </tr>
  );
}

function Results(props) {
  const { results, pagination, next, prev } = props;

  return (
    <React.Fragment>
      <input type="button" value="Prev" onClick={prev} disabled={pagination.offset === 0}/>
      <input type="button" value="Next" onClick={next} disabled={pagination.offset + 10 >= results.length}/>
      <span>Showing {number_format(pagination.offset)} to {number_format(pagination.offset + pagination.count)} of {number_format(results.length)} results.</span>
      <table>
        <thead>
          <tr>
            <th>Defence</th>
            <th><img style={{width: 16}} src={fire}/></th>
            <th><img style={{width: 16}} src={water}/></th>
            <th><img style={{width: 16}} src={thunder}/></th>
            <th><img style={{width: 16}} src={ice}/></th>
            <th><img style={{width: 16}} src={dragon}/></th>
            <th>Head</th>
            <th>Chest</th>
            <th>Arms</th>
            <th>Waist</th>
            <th>Legs</th>
            <th>Decorations</th>
            <th>Slots</th>
          </tr>
        </thead>
        <tbody>
        {results.slice(pagination.offset, pagination.offset + pagination.count).map((r, i) => <Row key={i} set={r}/>)}
        </tbody>
      </table>
    </React.Fragment>
  );
}


function mapStateToProps(state) {
  return {
    results: state.results.sets,
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
