// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import { getSocketClient } from '../socket/socketClient';

// const initialState = {
//   connectionStatus: '',
//   socket: null,
// };

// // Kết nối socket với role
// export const connectToSocket = createAsyncThunk('socket/connect', async (role, thunkAPI) => {
//   const socket = getSocketClient(role);
//   socket.connect();
//   return socket;
// });

// export const disconnectFromSocket = createAsyncThunk('socket/disconnect', async (_, thunkAPI) => {
//   const { socket } = thunkAPI.getState().socket;
//   if (socket) {
//     socket.disconnect();
//   }
//   return null;
// });

// const socketSlice = createSlice({
//   name: 'socket',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(connectToSocket.pending, (state) => {
//       state.connectionStatus = 'connecting';
//     });
//     builder.addCase(connectToSocket.fulfilled, (state, action) => {
//       state.connectionStatus = 'connected';
//       state.socket = action.payload;
//     });
//     builder.addCase(connectToSocket.rejected, (state) => {
//       state.connectionStatus = 'failed';
//     });

//     builder.addCase(disconnectFromSocket.pending, (state) => {
//       state.connectionStatus = 'disconnecting';
//     });
//     builder.addCase(disconnectFromSocket.fulfilled, (state) => {
//       state.connectionStatus = 'disconnected';
//       state.socket = null;
//     });
//   },
// });

// export default socketSlice.reducer;


// src/store/socketSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import socketClient from '../socket/socketClient';

export const connectSocket = createAsyncThunk('socket/connect', async (role) => {
  socketClient.init(role).connect();
});

export const disconnectSocket = createAsyncThunk('socket/disconnect', async () => {
  socketClient.disconnect();
});

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connected: false,
    role: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(connectSocket.fulfilled, (state, action) => {
      state.connected = true;
    });
    builder.addCase(disconnectSocket.fulfilled, (state, action) => {
      state.connected = false;
    });
  },
});

export default socketSlice.reducer;
