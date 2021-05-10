import React from 'react';

import { connect } from 'react-redux';

import { Label } from '../components/Label';


function SearchControls(props) {
  const { count, total, paused, stopped, pause, resume, stop } = props;

  return (
    <fieldset>
      <div>
        { paused ?
        <input type={'button'} value={'Resume'} onClick={resume} disabled={stopped}/>
        :
        <input type={'button'} value={'Pause'} onClick={pause} disabled={stopped}/>
        }
        <input type={'button'} value={'Stop'} onClick={stop} disabled={stopped}/>
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
    total: state.results.total,
    paused: state.worker.paused,
    stopped: state.worker.stopped
  };
}

function mapDispatchToProps(dispatch) {
  return {
    pause: () => dispatch({type: 'worker', payload: {type: 'pause'}}),
    resume: () => dispatch({type: 'worker', payload: {type: 'resume'}}),
    stop: () => dispatch({type: 'worker', payload: {type: 'stop'}})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchControls);
