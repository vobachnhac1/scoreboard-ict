import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import logger from 'redux-logger';
import rootReducer from './reducers/global-reducer';
import { useDispatch, useSelector } from 'react-redux';

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: true,
            serializableCheck: false,
        }).concat(logger),
});

const persistor = persistStore(store);

export const useAppDispatch = () => /** @type {any} */(useDispatch());
export const useAppSelector = useSelector;
export { store, persistor };
