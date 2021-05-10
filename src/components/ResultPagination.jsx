import React from 'react';

import { connect } from 'react-redux';
import { number_format } from '../util';

function ResultPagination(props) {
  const { found, pagination, order, next, prev } = props;
  const max = Math.min(pagination.offset + pagination.count, found);


  const map = k => {
    switch (k)
    {
      case 'raw.raw':
        return 'defence';
      case 'raw.fire':
        return 'fire';
      case 'raw.water':
        return 'water';
      case 'raw.thunder':
        return 'thunder';
      case 'raw.ice':
        return 'ice';
      case 'raw.dragon':
        return 'dragon';
      default:
        return k;
    }
  }
  const sorting = order.map(o => `${map(o.key)}${o.descending ? '' : ' (ascending)'}`).join(', then by ') + '.';

  return (
    <fieldset>
      <div>
        <input type={'button'} value={'Prev'} onClick={prev} disabled={pagination.offset === 0}/>
        <input type={'button'} value={'Next'} onClick={next} disabled={pagination.offset + pagination.count >= found}/>
      </div>
      <div>Showing {number_format(pagination.offset)} to {number_format(max)} of {number_format(found)} results.</div>
      {order.length ?
        <div>Sorting by {sorting}</div>
      :
        <div>Unsorted</div>
      }
    </fieldset>
  );
}

function mapStateToProps(state) {
  return {
    found: state.game[state.game.game].results.sets.length,
    pagination: state.game[state.game.game].results.pagination,
    order: state.game[state.game.game].results.order
  };
}

function mapDispatchToProps(dispatch) {
  return {
    next: () => dispatch({type: 'next'}),
    prev: () => dispatch({type: 'prev'})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultPagination);
