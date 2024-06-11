import { combineReducers } from 'redux';
import socketReducer from './socket-reducer';
import languageReducer from './language-reducer';
// import userReducer from './User/User.reducer.jsx';

const globalReducer = combineReducers({
  // user: userReducer,
  socket: socketReducer,
  language: languageReducer
});

export default globalReducer;
