import { createStore, combineReducers, applyMiddleware } from 'redux';

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
      if (state.effects.find(e => e.skill === action.payload.skill))
      {
        const effects = [...state.effects];
        effects.find(e => e.skill === action.payload.skill).points = action.payload.points;
        return {...state, effects};
      }
      return {...state, effects: [...state.effects, action.payload]};
    case 'remove_effect':
      return {...state, effects: state.effects.filter(e => e.skill !== action.payload)};
    case 'reset':
      return {...state, vr: 9, hr: 9, gender: 1, class: 1, slots: 0, allow_bad: false, allow_piercings: false, allow_torsoinc: false, allow_dummy: false, effects: []};
    default:
      return state;
  }
};

function filter(state = {}, action) {
  switch (action.type)
  {
    case 'filter':
      return {...state, [action.payload.category]: action.payload.value};
    default:
      return state;
  }
}

function results(state = {pagination: {offset: 0, count: 100}, order: [], sets: [], count: 0, total: 0}, action) {
  switch (action.type)
  {
    case 'next':
    {
      const offset = state.pagination.offset + state.pagination.count;
      if (offset >= state.sets.length)
        return state;
      return {...state, pagination: {...state.pagination, offset}}
    }
    case 'prev':
    {
      const offset = state.pagination.offset - state.pagination.count;
      if (offset < 0)
        return state;
      return {...state, pagination: {...state.pagination, offset}}
    }
    case 'clear':
      return {...state, pagination: {...state.pagination, offset: 0}, sets: [], count: 0, total: 0};
    case 'set':
      return {...state, sets: [...state.sets, action.payload]};
    case 'progress':
      return {...state, ...action.payload};
    case 'sets':
      return {...state, sets: [...state.sets, ...action.payload]};
    case 'order':
    {
      const index = state.order.findIndex(o => o.key === action.payload);
      if (index >= 0)
      {
        if (state.order[index].descending === true)
          return {...state, order: [...state.order.slice(0, index), ...state.order.slice(index+1), {key: action.payload, descending: false}]};
        return {...state, order: [...state.order.slice(0, index), ...state.order.slice(index+1)]};
      }
      return {...state, order: [...state.order, {key: action.payload, descending: true}]};
    }
    default:
      return state;
  }
}

function history(state = [], action) {
  switch (action.type)
  {
    case 'push_history':
      return [action.payload, ...state];
    case 'remove_history':
      return [...state.slice(0, action.payload), ...state.slice(action.payload+1)];
    default:
      return state;
  }
}

function settings(state = {defence: 'effective', language: 'english'}, action) {
  switch (action.type)
  {
    case 'language':
      return {...state, language: action.payload};
    default:
      return state;
  }
}

let _worker = null;
const workerMiddleware = store => next => action => {
  if (_worker === null)
  {
    _worker = new Worker('./worker.js');
    _worker.onmessage = m => store.dispatch(m.data);
  }

  if (action.type !== 'worker')
    return next(action);

  _worker.postMessage(action.payload);
}

function worker(state = {paused: false, stopped: true}, action) {
  switch (action.type)
  {
    case 'started':
      return {...state, stopped: false, paused: false};
    case 'stopped':
      return {...state, stopped: true};
    case 'paused':
      return {...state, paused: true};
    case 'resumed':
      return {...state, paused: false};
    default:
      return state;
  }
}

const reducer = combineReducers({
  search,
  filter,
  results,
  history,
  settings,
  worker,
});

const config = {
  key: 'bass',
  storage: storage,
  stateReconciler: autoMergeLevel1,
  blacklist: ['results', 'worker']
};

const pReducer = persistReducer(config, reducer);
const store = createStore(pReducer, applyMiddleware(workerMiddleware));
const persistor = persistStore(store);
// persistor.purge();
export { store, persistor };
