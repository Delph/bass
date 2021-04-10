import { createStore, combineReducers } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';

function search(state = {
  vr: 9,
  hr: 9,
  gender: 1,
  class: 1,
  slots: 0,
  allow_bad: false,
  allow_piercings: false,
  allow_torsoinc: false,
  allow_dummy: false,
  effects: []
}, action) {
  switch (action.type)
  {
    case 'vr':
    case 'hr':
    case 'gender':
    case 'class':
    case 'slots':
    case 'allow_bad':
    case 'allow_piercings':
    case 'allow_torsoinc':
    case 'allow_dummy':
      return {...state, [action.type]: action.payload};
    case 'add_effect':
      if (state.effects.includes(action.payload))
        return state;
      return {...state, effects: [...state.effects, action.payload]};
    case 'remove_effect':
      return {...state, effects: state.effects.filter(e => e.skill !== action.payload)};
    default:
      return state;
  }
};

function results(state = {pagination: {offset: 0, count: 100}, sets: []}, action) {
  switch (action.type)
  {
    case 'next':
    {
      const offset = state.pagination.offset + state.pagination.count;
      console.log(offset);
      if (offset > state.sets.length)
        return state;
      return {...state, pagination: {...state.pagination, offset}}
    }
    case 'prev':
    {
      const offset = state.pagination.offset - state.pagination.count;
      console.log(offset);
      if (offset < 0)
        return state;
      return {...state, pagination: {...state.pagination, offset}}
    }
    case 'clear':
      return {pagination: {...state.pagination, offset: 0}, sets: []};
    case 'set':
      return {...state, sets: [...state.sets, action.payload]};
    case 'sets':
      console.log(`Received ${action.payload.length} - ${state.sets.length}`);
      return {...state, sets: [...state.sets, ...action.payload]};
    default:
      return state;
  }
}

function history(state = [], action) {
  return state;
}

function settings(state = {}, action) {
  return state;
}

function basic(state = {}, action) {
  return state;
}

const reducer = combineReducers({
  search,
  results,
  history,
  settings,
  basic
});

const config = {
  key: 'bass',
  storage: storage,
  stateReconciler: autoMergeLevel1,
  blacklist: ['results']
};

const pReducer = persistReducer(config, reducer);
const store = createStore(pReducer);
const persistor = persistStore(store);
// persistor.purge();
export { store, persistor };
