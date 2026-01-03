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


// Socket Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import socketClient from '../../socket/SocketClient';

export const connectSocket = createAsyncThunk('socket/connect', async (role) => {
  socketClient.init(role).connect();

  // Đợi socket connect
  return new Promise((resolve) => {
    const checkConnection = () => {
      if (socketClient.isConnected()) {
        resolve({ connected: true, role });
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    checkConnection();
  });
});

export const disconnectSocket = createAsyncThunk('socket/disconnect', async () => {
  socketClient.disconnect();
  return { connected: false };
});

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    connected: false,
    role: '',
    socketId: null,
  },
  reducers: {
    // Manual update connection status
    setConnected: (state, action) => {
      state.connected = action.payload.connected;
      state.socketId = action.payload.socketId || null;
      console.log('Redux: Manual update connected =', state.connected, 'socketId =', state.socketId);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectSocket.fulfilled, (state, action) => {
      state.connected = action.payload.connected;
      state.role = action.payload.role;
      console.log('Redux state updated: connected =', state.connected);
    });
    builder.addCase(disconnectSocket.fulfilled, (state, action) => {
      state.connected = action.payload.connected;
      state.socketId = null;
      console.log('Redux state updated: connected =', state.connected);
    });
  },
});

export const { setConnected } = socketSlice.actions;

export default socketSlice.reducer;

// Setup socket event listeners để auto-update Redux state
export const setupSocketListeners = (store) => {
  const socket = socketClient.getInstance();

  if (socket) {
    // Listen connect event
    socket.on('connect', () => {
      console.log('Socket connected event, updating Redux state');
      store.dispatch(setConnected({
        connected: true,
        socketId: socket.id
      }));
    });

    // Listen disconnect event
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected event, updating Redux state. Reason:', reason);
      store.dispatch(setConnected({
        connected: false,
        socketId: null
      }));
    });

    console.log('Socket event listeners setup complete');
  }
};
