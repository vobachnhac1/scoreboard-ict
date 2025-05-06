import { composeWithDevTools } from 'redux-devtools-extension';

import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import {thunk} from 'redux-thunk';
import logger from 'redux-logger';

import rootReducer from './reducers/global-reducer';

const persistConfig = {
    key: 'root',
    storage: storage,
    // whitelist: ['vovinam']
};

const middlewares = [thunk, logger];

const enhancer = compose(
    composeWithDevTools(
        applyMiddleware(...middlewares),
    )
);

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer,
    enhancer
);
const persistor = persistStore(store);

export default { persistor: persistor, store: store };
