import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../../helpers/api';

const API_URL = '/api/champion-event';

export const fetchChampionEvents = createAsyncThunk('championEvent/fetchAll', async (id) => {
  const url = id !== undefined && id !== null ? `${API_URL}/${id}` : API_URL;
  const response = await axiosClient.get(url);
  return response.data;
});

export const addChampionEvent = createAsyncThunk('championEvent/add', async (formData) => {
  const response = await axiosClient.post(API_URL, formData);
  return response.data;
});

export const deleteChampionEvent = createAsyncThunk('championEvent/delete', async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
  return id;
});

// @ts-ignore
export const updateChampionEvent = createAsyncThunk('championEvent/update', async ({ id, formData }) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, formData);
  return response.data;
});

export const addAndRefreshChampionEvent = createAsyncThunk(
  'championEvent/addAndRefresh',
  // @ts-ignore
  async ({ formData }, { dispatch }) => {
    await dispatch(addChampionEvent(formData));
    await dispatch(fetchChampionEvents(formData.category_key));
  }
);

export const updateAndRefreshChampionEvents = createAsyncThunk(
  'championEvent/updateAndRefresh',
  // @ts-ignore
  async ({ formData }, { dispatch }) => {
    // @ts-ignore
    await dispatch(updateChampionEvent({ id: formData.id, formData }));
    await dispatch(fetchChampionEvents(formData.category_key));
  }
);

const championEventSlice = createSlice({
  name: 'championEvents',
  initialState: {
    events: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampionEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampionEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchChampionEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(deleteChampionEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(group => group.id !== action.payload);
      })
      .addCase(updateChampionEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
  },
});

export default championEventSlice.reducer;
