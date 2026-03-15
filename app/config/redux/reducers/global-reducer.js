import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import socketReducer from './socket-reducer';
import languageReducer from './language-reducer';
import configReducer from './configReducer';

import championReducer from '../controller/championSlice';
import championGroupReducer from '../controller/championGroupSlice';
import championCategoryReducer from '../controller/championCategorySlice';
import championEventReducer from '../controller/championEventSlice';
import championEventGroupsReducer from '../controller/championEventGroupSlice';
import configSystemReducer from '../controller/configSystemSlice';
import licenseReducer from '../controller/licenseSlice';

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

// persist config cho license
const licensePersistConfig = {
  key: 'license',
  storage: storage,
};

const rootReducer = combineReducers({
  socket: persistReducer(authPersistConfig, socketReducer),
  language: persistReducer(settingsPersistConfig, languageReducer),
  config: persistReducer(settingsPersistConfig, configReducer),
  license: persistReducer(licensePersistConfig, licenseReducer),

  champions: championReducer,
  championGroups: championGroupReducer,
  championCategories: championCategoryReducer,
  championEvents: championEventReducer,
  championEventGroups: championEventGroupsReducer,
  configSystem: configSystemReducer,
});

export default rootReducer;
