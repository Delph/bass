import React, { useEffect } from 'react';

import { BrowserRouter, Route } from 'react-router-dom';

import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './store';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { TabBar } from './components/Navigation';

import Search from './screens/Search';
import Results from './screens/Results';
import History from './screens/History';
import Settings from './screens/Settings';

import style from './css/App.module.css';
import { heads, chests, arms, waists, legs, decorations, skills } from './gamedata';

library.add(fas);

function Body(props) {
  return (
    <div className={style.body}>
      <Route path={'/'} exact component={Search}/>
      <Route path={'/results'} component={Results}/>
      <Route path={'/sets'} component={Sets}/>
      <Route path={'/builder'} component={Builder}/>
      <Route path={'/history'} component={History}/>
      <Route path={'/settings'} component={Settings}/>
      <Route path={'/about'} component={About}/>
      <Route path={'/changelog'} component={Changelog}/>
    </div>
  );
}

function Startup_(props) {
  const { children, worker } = props;

  useEffect(() => {
    worker({type: 'skills', payload: skills});
    worker({type: 'decorations', payload: decorations});
    worker({type: 'armour', payload: {heads, chests, arms, waists, legs}});
  },
  [worker]);

  return children;
}
const Startup = connect(null, mapDispatchToProps)(Startup_);

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <BrowserRouter>
          <Startup>
            <Body/>
            <TabBar/>
          </Startup>
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

function Builder() {
  return (
    <React.Fragment>
      <h1>Builder</h1>
    </React.Fragment>
  );
}

function About() {
  return (
    <p>Browser Armour Set Search</p>
  );
}

function Changelog() {
  return (
    <React.Fragment>
      <h1>Changelog</h1>
      <div>
        <h3>0.1.1</h3>
        <ul>
          <li>Added a change log!</li>
          <li>Text search filter on skills and effects</li>
          <li>Search reset button to clear state</li>
          <li>Descriptive text of current sorting method</li>
          <li>Fixed some meta data and manifest items</li>
          <li>Fixed routing (404 on results/settings)</li>
        </ul>
      </div>
      <div>
        <h3>0.1.0</h3>
        <ul>
          <li>Initial release</li>
        </ul>
      </div>
    </React.Fragment>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    worker: payload => dispatch({type: 'worker', payload})
  }
}

export default App;
