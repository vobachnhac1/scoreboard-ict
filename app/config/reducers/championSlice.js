import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../helpers/api';

const API_URL = '/api/champion';

export const fetchChampions = createAsyncThunk('champions/fetchAll', async () => {
  const response = await axiosClient.get(API_URL);
  return response.data;
});

export const addChampion = createAsyncThunk('champions/add', async (newChampion) => {
  const response = await axiosClient.post(API_URL, newChampion);
  return response.data;
});

export const deleteChampion = createAsyncThunk('champions/delete', async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
  return id;
});

// @ts-ignore
export const updateChampion = createAsyncThunk('champions/update', async ({ id, updatedChampion }) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, updatedChampion);
  return response.data;
});

const championSlice = createSlice({
  name: 'champions',
  initialState: {
    champions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampions.fulfilled, (state, action) => {
        state.loading = false;
        state.champions = action.payload;
      })
      .addCase(fetchChampions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampion.fulfilled, (state, action) => {
        state.champions.push(action.payload);
      })
      .addCase(deleteChampion.fulfilled, (state, action) => {
        state.champions = state.champions.filter(champion => champion.id !== action.payload);
      })
      .addCase(updateChampion.fulfilled, (state, action) => {
        const index = state.champions.findIndex(champion => champion.id === action.payload.id);
        if (index !== -1) {
          state.champions[index] = action.payload;
        }
      });
  },
});

export default championSlice.reducer;
