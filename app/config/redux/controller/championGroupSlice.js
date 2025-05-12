import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../apis/axiosClient';

const API_URL = '/champion-grp';

export const fetchChampionGroups = createAsyncThunk('championGroups/fetchAll', async (id) => {
  const url = id !== undefined && id !== null ? `${API_URL}/${id}` : API_URL;
  const response = await axiosClient.get(url);
  return response.data;
});

// @ts-ignore
export const addChampionGroup = createAsyncThunk('championGroups/add', async ({formData}) => {
  const response = await axiosClient.post(API_URL, formData);
  return response.data;
});

export const deleteChampionGroup = createAsyncThunk('championGroups/delete', async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
  return id;
});

// @ts-ignore
export const updateChampionGroup = createAsyncThunk('championGroups/update', async ({ id, formData }) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, formData);
  return response.data;
});

const championGroupSlice = createSlice({
  name: 'championGroups',
  initialState: {
    groups: [],
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
        state.groups = action.payload;
      })
      .addCase(fetchChampionGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionGroup.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      .addCase(deleteChampionGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(group => group.id !== action.payload);
      })
      .addCase(updateChampionGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
  },
});

export default championGroupSlice.reducer;
