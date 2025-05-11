import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import socketReducer from './socket-reducer';
import languageReducer from './language-reducer';
import configReducer from './configReducer';

import championReducer from '../controller/championSlice';
import championGroupReducer from '../controller/championGroupSlice';
import championCategoryReducer from '../controller/championCategorySlice';
import configSystemReducer from '../controller/configSystemSlice';

// persist config cho auth
const authPersistConfig = {
  key: 'auth',
  storage: storage,
  // whitelist: ['token', 'userInfo']
};

// persist config cho settings
const settingsPersistConfig = {
  key: 'settings',
  storage: storage,
};

const rootReducer = combineReducers({
  socket: persistReducer(authPersistConfig, socketReducer),
  language: persistReducer(settingsPersistConfig, languageReducer),
  config: persistReducer(settingsPersistConfig, configReducer),

  champions: championReducer,
  championGroups: championGroupReducer,
  championCategories: championCategoryReducer,
  configSystem: configSystemReducer,
});

export default rootReducer;
