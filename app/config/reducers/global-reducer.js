import { combineReducers } from 'redux';
import socketReducer from './socket-reducer';
// import userReducer from './User/User.reducer.jsx';

const globalReducer = combineReducers({
  // user: userReducer,
  socket: socketReducer
});

export default globalReducer;
