import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../apis/axiosClient';

const API_URL = '/champion-category';

export const fetchChampionCategories = createAsyncThunk('championCategories/fetchAll', async (params) => {
  const response = await axiosClient.get(API_URL, { params });
  return response.data;
});

// @ts-ignore
export const addChampionCategory = createAsyncThunk('championCategories/add', async ({ formData }) => {
  const response = await axiosClient.post(API_URL, formData);
  return response.data;
});

export const deleteChampionCategory = createAsyncThunk('championCategories/delete', async (id) => {
  await axiosClient.delete(`${API_URL}/${id}`);
  return id;
});

// @ts-ignore
export const updateChampionCategory = createAsyncThunk('championCategories/update', async ({ id, formData }) => {
  const response = await axiosClient.put(`${API_URL}/${id}`, formData);
  return response.data;
});

const championCategorySlice = createSlice({
  name: 'championCategories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChampionCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChampionCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchChampionCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(deleteChampionCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category.id !== action.payload);
      })
      .addCase(updateChampionCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      });
  },
});

export default championCategorySlice.reducer;
