import React from 'react';

import { BrowserRouter, Route, Link } from 'react-router-dom';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './store';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { TabBar } from './components/Navigation';

import Search from './screens/Search';
import Results from './screens/Results';

import { InputField } from './components/InputField';
import { Radio } from './components/Radio';
import { Select } from './components/Select';

import style from './css/App.module.css';

library.add(fas);

function Body(props) {
  return (
    <div className={style.body}>
      <Route path={'/'} exact component={Search}/>
      <Route path={'/results'} component={Results}/>
      <Route path={'/sets'} component={Sets}/>
      <Route path={'/History'} component={History}/>
      <Route path={'/settings'} component={Settings}/>
      <Route path={'/about'} component={About}/>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <BrowserRouter>
          <Body/>
          <TabBar/>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

function Sets() {
  return (
    <React.Fragment>
      <h1>Sets</h1>
    </React.Fragment>
  );
}

function History() {
  return (
    <React.Fragment>
      <h1>History</h1>
    </React.Fragment>
  );
}

function Settings() {
  const games = [
    {
      value: 'mhfu',
      label: 'MHFU'
    }
  ];

  return (
    <React.Fragment>
      <h1>Settings</h1>
      <Select options={games}/>

      <Radio name={'defence_display'} value={'raw'}/>
      <Radio name={'defence_display'} value={'effective'}/>
      <InputField type={'number'} min={1} step={1} max={8}/>
      <Link to={'/about'}>About</Link>

    </React.Fragment>
  );
}

function About() {
  return (
    <p>Browser Armour Set Search</p>
  );
}

export default App;
