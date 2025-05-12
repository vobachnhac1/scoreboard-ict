import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createChampCategory, deleteChampCategory, getAllChampCategories, updateChampCategory } from "../../apis";

export const fetchChampionCategories = createAsyncThunk("championCategories/fetchAll", async (params) => {
  const response = await getAllChampCategories(params);
  return response.data;
});

// @ts-ignore
export const addChampionCategory = createAsyncThunk("championCategories/add", async ({ formData }) => {
  const response = await createChampCategory(formData);
  return response.data;
});

export const deleteChampionCategory = createAsyncThunk("championCategories/delete", async (id) => {
  await deleteChampCategory(id);
  return id;
});

// @ts-ignore
export const updateChampionCategory = createAsyncThunk("championCategories/update", async ({ id, formData }) => {
  const response = await updateChampCategory(id, formData);
  return response.data;
});

const championCategorySlice = createSlice({
  name: "championCategories",
  initialState: {
    data: [],
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
        state.data = action.payload;
      })
      .addCase(fetchChampionCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionCategory.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteChampionCategory.fulfilled, (state, action) => {
        state.data = state.data.filter((category) => category.id !== action.payload);
      })
      .addCase(updateChampionCategory.fulfilled, (state, action) => {
        const index = state.data.findIndex((category) => category.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      });
  },
});

export default championCategorySlice.reducer;
