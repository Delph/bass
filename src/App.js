import React, { useEffect } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from './store';

// font awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import TabBar from './components/Navigation';

import Search from './screens/Search';
import Results from './screens/Results';
import Sets from './screens/Sets';
import History from './screens/History';
import Settings from './screens/Settings';

import style from './css/App.module.css';
import { game } from './gamedata';

library.add(fas);

function Body(props) {
  return (
    <div className={style.body}>
      <Routes>
        <Route path={'/'} exact element={<Search/>}/>
        <Route path={'/results'} element={<Results/>}/>
        <Route path={'/sets'} element={<Sets/>}/>
        <Route path={'/builder'} element={<Builder/>}/>
        <Route path={'/history'} element={<History/>}/>
        <Route path={'/settings'} element={<Settings/>}/>
        <Route path={'/about'} element={<About/>}/>
        <Route path={'/changelog'} element={<Changelog/>}/>
      </Routes>
    </div>
  );
}

function Startup_(props) {
  const { children, worker } = props;

  useEffect(() => {
    worker({type: 'skills', payload: game().skills});
    worker({type: 'decorations', payload: game().decorations});
    worker({type: 'armour', payload: game().gear});
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
        <h3>0.2.3</h3>
        <ul>
          <li>Update dependencies</li>
        </ul>
      </div>
      <div>
        <h3>0.2.2</h3>
        <ul>
          <li>Sets feature</li>
          <ul>
            <li>On the Results screen, sets can be saved.</li>
            <li>These sets can be later accessed from the Sets screen.</li>
          </ul>
          <li>Improved history management. Searching for the same set twice will no longer cause duplicate history entries, but just update the timestamp on the original entry.</li>
        </ul>
      </div>
      <div>
        <h3>0.2.1</h3>
        <ul>
          <li>Removed Ice from MHF.</li>
          <li>Implemented Torso +1 and Torso +2 for MHF.</li>
          <li>Removed the display of skills with no effects (Torso Inc, Torso +1, and Torso +2).</li>
        </ul>
      </div>
      <div>
        <h3>0.2.0</h3>
        <ul>
          <li>MHF support. Game can be switched in settings.</li>
        </ul>
      </div>
      <div>
        <h3>0.1.2</h3>
        <ul>
          <li>Added search history</li>
          <ul>
            <li>Your search queries will appear in the history</li>
            <li>Entries in the history can be searched again or removed using the buttons</li>
          </ul>
          <li>Added notices</li>
        </ul>
      </div>
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
