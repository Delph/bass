import React from 'react';

import { connect } from 'react-redux';
import { number_format } from '../util';

function ResultPagination(props) {
  const { found, pagination, next, prev } = props;
  const max = Math.min(pagination.offset + pagination.count, found);

  return (
    <fieldset>
      <div>
        <input type={'button'} value={'Prev'} onClick={prev} disabled={pagination.offset === 0}/>
        <input type={'button'} value={'Next'} onClick={next} disabled={pagination.offset + pagination.count >= found}/>
      </div>
      <div>Showing {number_format(pagination.offset)} to {number_format(max)} of {number_format(found)} results.</div>
    </fieldset>
  );
}

function mapStateToProps(state) {
  return {
    found: state.results.sets.length,
    pagination: state.results.pagination
  };
}

function mapDispatchToProps(dispatch) {
  return {
    next: () => dispatch({type: 'next'}),
    prev: () => dispatch({type: 'prev'})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultPagination);
