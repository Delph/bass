import React from 'react';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

// import { Label } from '../components/Label';
// import { Radio } from '../components/Radio';
// import { InputField } from '../components/InputField';
import { Select } from '../components/Select';


function Settings(props) {
  const { settings, set_language } = props;

  // const games = [
  //   {
  //     value: 'mhfu',
  //     label: 'MHFU'
  //   }
  // ];

  const languages = ['Deutsch', 'English', 'Español', 'Français', 'Italiano'];

  return (
    <React.Fragment>
      <h1>Settings</h1>

      <Select options={languages.map(l => { return {value: l.toLowerCase(), label: l}; })} value={settings.language} onChange={set_language}/>

      {/*
      <Label text={'Defence display'}>
        <Radio name={'defence_display'} value={'raw'}/>
        <Radio name={'defence_display'} value={'effective'}/>
      </Label>
      <Label text={'Workers'}>
        <InputField type={'number'} min={1} step={1} max={8}/>
      </Label>
      */}
      <Link to={'/about'}>About</Link>

    </React.Fragment>
  );
}

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return {
    set_language: e => dispatch({type: 'language', payload: e.target.value})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
