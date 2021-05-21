import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import { createMigrate, persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

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
      return [{...action.payload, timestamp: Date.now()}, ...state];
    case 'remove_history':
    {
      const index = state.findIndex(e => {
        for (const k of Object.keys(e))
        {
          if (k === 'timestamp')
            continue;
          if (e[k] !== action.payload[k])
            return false;
        }
        return true;
      });
      if (index === -1)
        return state;
      return [...state.slice(0, index), ...state.slice(index + 1)];
    }
    case 'add_history':
    {
      const index = state.findIndex(e => {
        for (const k of Object.keys(e))
        {
          if (k === 'timestamp')
            continue;
          if (e[k] !== action.payload[k])
            return false;
        }
        return true;
      });
      if (index === -1)
        return [{...action.payload, timestamp: Date.now()}, ...state];
      return [{...action.payload, timestamp: Date.now()}, ...state.slice(0, index), ...state.slice(index+1)];
    }
    default:
      return state;
  }
}

function sets(state = [], action) {
  switch (action.type)
  {
    case 'set_add':
      return [...state, action.payload];
    case 'set_remove':
      const index = state.indexOf(action.payload);
      return [...state.slice(0, index), ...state.slice(index + 1)];
    case 'set_move_up':
    {
      const index = state.indexOf(action.payload);
      if (index <= 0)
        return state;

      const sets = [...state];
      sets.splice(index - 1, 0, sets.splice(index, 1)[0]);
      return sets;
    }
    case 'set_move_down':
    {
      const index = state.indexOf(action.payload);
      if (index === -1 || index >= state.length - 1)
        return state;

      const sets = [...state];
      sets.splice(index + 1, 0, sets.splice(index, 1)[0]);
      return sets;
    }
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

function notices(state = [], action) {
  switch (action.type)
  {
    case 'seen':
      return [...state, action.payload];
    default:
      return state;
  }
}

const gameReducer = combineReducers({
  search,
  filter,
  history,
  sets,
  settings
});

function game(state = {game: 'mhfu'}, action)
{
  switch (action.type)
  {
    case 'game':
      return {...state, [action.payload]: gameReducer(state[action.payload], {action: undefined}), game: action.payload};
    case 'persist/REHYDRATE':
      return state;
    default:
      return {...state, [state.game]: gameReducer(state[state.game], action)};
  }
}

const reducer = combineReducers({
  worker,
  game,
  results,
  notices
});

function migration6(state) {
  const newstate = {...state};

  newstate.mhfu.sets = [];
  newstate.mhf.sets = [];

  return newstate;
}

const migrations = {
  0: state => state,
  1: state => ({...state, notices: []}),
  2: state => ({...state, settings: {...state.settings, game: 'mhfu'}}),
  3: state => ({...state, settings: {...state.settings, game: undefined}}),
  4: state => undefined, // just nuke it
  5: state => state,
  6: state => migration6(state)
};


const config = {
  key: 'bass',
  storage: storage,
  stateReconciler: autoMergeLevel2,
  blacklist: ['results', 'worker'],
  version: 6,
  migrate: createMigrate(migrations, {debug: false})
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const pReducer = persistReducer(config, reducer);
const store = createStore(pReducer, composeEnhancers(applyMiddleware(workerMiddleware)));
const persistor = persistStore(store);
// persistor.purge();
export { store, persistor };
