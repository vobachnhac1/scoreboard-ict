// @ts-nocheck
import { combineReducers } from 'redux';
import socketReducer from './socket-reducer';
import languageReducer from './language-reducer';
import configReducer from './configReducer';

import championReducer from './championSlice';
import championGroupReducer from './championGroupSlice';
import championCategoryReducer from './championCategorySlice';

const globalReducer = combineReducers({
  // user: userReducer,
  socket: socketReducer,
  language: languageReducer,
  config: configReducer,

  champions: championReducer,
  championGroups: championGroupReducer,
  championCategories: championCategoryReducer,
});

export default globalReducer;
