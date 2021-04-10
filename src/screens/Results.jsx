import React from 'react';

import { connect } from 'react-redux';

import { number_format } from '../util';


function Row({set}) {
  const torso_inc = set.combination.filter(g => g.torso_inc).length;
  const defence = set.combination.map(p => p.defence).reduce((a, c) => a + c, 0);
  const fire = set.combination.map(p => p.res.fire).reduce((a, c) => a + c, 0);
  const water = set.combination.map(p => p.res.water).reduce((a, c) => a + c, 0);
  const thunder = set.combination.map(p => p.res.thunder).reduce((a, c) => a + c, 0);
  const ice = set.combination.map(p => p.res.ice).reduce((a, c) => a + c, 0);
  const dragon = set.combination.map(p => p.res.dragon).reduce((a, c) => a + c, 0);
  return (
    <tr>
      <td>{defence}</td>
      <td>{fire}</td>
      <td>{water}</td>
      <td>{thunder}</td>
      <td>{ice}</td>
      <td>{dragon}</td>
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
            <th>Fire</th>
            <th>Water</th>
            <th>Thunder</th>
            <th>Ice</th>
            <th>Dragon</th>
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
