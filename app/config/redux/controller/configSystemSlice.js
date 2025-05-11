import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../../helpers/api';

const API_URL = '/api/config';

export const fetchConfigSystem = createAsyncThunk('configSystem/fetchAll', async () => {
  const response = await axiosClient.post(`${API_URL}/get-config-system`);
  return response.data;
});

export const updateConfigSystem = createAsyncThunk('configSystem/update', async (formData) => {
  const response = await axiosClient.post(`${API_URL}/update-config-system`, formData);
  return response.data;
});

export const updateAndRefreshConfigSystem = createAsyncThunk(
  'configSystem/updateAndRefresh',
  async (formData, { dispatch }) => {
    // @ts-ignore
    await dispatch(updateConfigSystem(formData));
    await dispatch(fetchConfigSystem());
  }
);

const configSystemSlice = createSlice({
  name: 'configSystem',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Config System
      .addCase(fetchConfigSystem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigSystem.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchConfigSystem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update Config System
      .addCase(updateConfigSystem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConfigSystem.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateConfigSystem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default configSystemSlice.reducer;
