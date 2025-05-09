import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../helpers/api';

const API_URL = '/api/champion-grp';

export const  fetchChampionGroups = createAsyncThunk('championGroups/fetchAll', async () => {
  const response = await axiosClient.get(API_URL);
  return response.data;
});

export const addChampionGroup = createAsyncThunk('championGroups/add', async (newChampionGroup) => {
  const response = await axiosClient.post(API_URL, newChampionGroup);
  return response.data;
});

export const deleteChampionGroup = createAsyncThunk('championGroups/delete', async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
  return id;
});

// @ts-ignore
export const updateChampionGroup = createAsyncThunk('championGroups/update', async ({ id, updatedChampionGroup }) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, updatedChampionGroup);
  return response.data;
});

export const fetchChampionGroupsByChampion = createAsyncThunk('championGroups/fetchByChampion', async (champId) => {
  const response = await axiosClient.get(`${API_URL}/${champId}`);
  return response.data;
});

const championGroupSlice = createSlice({
  name: 'championGroups',
  initialState: {
    championGroups: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampionGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampionGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.championGroups = action.payload;
      })
      .addCase(fetchChampionGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionGroup.fulfilled, (state, action) => {
        state.championGroups.push(action.payload);
      })
      .addCase(deleteChampionGroup.fulfilled, (state, action) => {
        state.championGroups = state.championGroups.filter(group => group.id !== action.payload);
      })
      .addCase(updateChampionGroup.fulfilled, (state, action) => {
        const index = state.championGroups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.championGroups[index] = action.payload;
        }
      })
      .addCase(fetchChampionGroupsByChampion.fulfilled, (state, action) => {
        state.championGroups = action.payload;
      });
  },
});

export default championGroupSlice.reducer;
