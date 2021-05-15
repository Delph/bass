import React from 'react';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Label } from '../components/Label';
// import { Radio } from '../components/Radio';
// import { InputField } from '../components/InputField';
import { Select } from '../components/Select';

import { games } from '../gamedata';


function Settings(props) {
  const { settings, game, worker, set_language } = props;

  const info = process.env.REACT_APP_VERSION;

  const languages = ['Deutsch', 'English', 'Español', 'Français', 'Italiano'];

  const set_game = e => {
    props.clear();
    props.set_game(e);
    worker({type: 'skills', payload: games[e.target.value].skills});
    worker({type: 'decorations', payload: games[e.target.value].decorations});
    worker({type: 'armour', payload: games[e.target.value].gear});
  }

  return (
    <React.Fragment>
      <h1>Settings</h1>

      <Label text={'Language'}>
        <Select options={languages.map(l => { return {value: l.toLowerCase(), label: l}; })} value={settings.language} onChange={set_language}/>
      </Label>

      <Label text={'Game'}>
        <Select options={Object.keys(games).map(g => ({value: g, label: g.toUpperCase()}))} value={game} onChange={set_game}/>
      </Label>

      {/*
      <Label text={'Defence display'}>
        <Radio name={'defence_display'} value={'raw'}/>
        <Radio name={'defence_display'} value={'effective'}/>
      </Label>
      <Label text={'Workers'}>
        <InputField type={'number'} min={1} step={1} max={8}/>
      </Label>
      <Link to={'/about'}>About</Link>
      */}
      <Link to={'/changelog'}>Changelog</Link>
      <div>Version: {info}</div>
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  return {
    settings: state.game[state.game.game].settings,
    game: state.game.game
  };
}

function mapDispatchToProps(dispatch) {
  return {
    set_language: e => dispatch({type: 'language', payload: e.target.value}),
    set_game: e => dispatch({type: 'game', payload: e.target.value}),
    clear: e => dispatch({type: 'clear'}),
    worker: payload => dispatch({type: 'worker', payload})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
