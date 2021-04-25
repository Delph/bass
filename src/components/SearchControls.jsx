import React from 'react';

import { connect } from 'react-redux';

import { Label } from '../components/Label';


function SearchControls(props) {
  const { count, total, stop } = props;

  return (
    <fieldset>
      <div>
        <input type={'button'} value={'Stop'} onClick={stop}/>
      </div>
      <div>
        <Label text={'Progress'}>
          <progress max={total} value={count}/>
        </Label>
      </div>
    </fieldset>
  );
}

function mapStateToProps(state) {
  return {
    count: state.results.count,
    total: state.results.total
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stop: () => dispatch({type: 'worker', payload: {type: 'stop'}})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchControls);
