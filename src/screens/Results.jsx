import React from 'react';

import { connect } from 'react-redux';

function Results(props) {
  const {results} = props;
  return (
    <React.Fragment>
      <h1>Results</h1>

      <ul>
        {results.map((r, i) => <li key={i}>{JSON.stringify(r)}</li>)}
      </ul>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  return {
    results: state.results
  };
}

export default connect(mapStateToProps)(Results);
