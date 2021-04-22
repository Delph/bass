import React from 'react';

import { BrowserRouter, Route } from 'react-router-dom';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './store';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { TabBar } from './components/Navigation';

import Search from './screens/Search';
import Results from './screens/Results';
import Settings from './screens/Settings';

import style from './css/App.module.css';

library.add(fas);

function Body(props) {
  return (
    <div className={style.body}>
      <Route path={'/'} exact component={Search}/>
      <Route path={'/results'} component={Results}/>
      <Route path={'/sets'} component={Sets}/>
      <Route path={'/builder'} component={Builder}/>
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

function Builder() {
  return (
    <React.Fragment>
      <h1>Builder</h1>
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

function About() {
  return (
    <p>Browser Armour Set Search</p>
  );
}

export default App;
