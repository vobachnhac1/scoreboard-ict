import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../apis/axiosClient';

const API_URL = '/champion-grp-event';

export const fetchChampionEventGroups = createAsyncThunk('championEventGroup/fetchAll', async (params) => {
  // @ts-ignore
  const response = await axiosClient.get(API_URL, { params });
  return response.data;
});

// @ts-ignore
export const addChampionEventGroup = createAsyncThunk('championEventGroup/add', async ({ formData }) => {
  const response = await axiosClient.post(API_URL, formData);
  return response.data;
});

export const deleteChampionEventGroup = createAsyncThunk('championEventGroup/delete', async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
  return id;
});

// @ts-ignore
export const updateChampionEventGroup = createAsyncThunk('championEventGroup/update', async ({ id, formData }) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, formData);
  return response.data;
});

const championEventGroupslice = createSlice({
  name: 'championEventGroups',
  initialState: {
    eventGroups: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampionEventGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampionEventGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.eventGroups = action.payload;
      })
      .addCase(fetchChampionEventGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionEventGroup.fulfilled, (state, action) => {
        state.eventGroups.push(action.payload);
      })
      .addCase(deleteChampionEventGroup.fulfilled, (state, action) => {
        state.eventGroups = state.eventGroups.filter(group => group.champ_grp_event_id !== action.payload);
      })
      .addCase(updateChampionEventGroup.fulfilled, (state, action) => {
        const index = state.eventGroups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.eventGroups[index] = action.payload;
        }
      })
  },
});

export default championEventGroupslice.reducer;
