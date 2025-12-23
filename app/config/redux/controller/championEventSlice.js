import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createChampEvent, deleteChampEvent, getAllChampEventsByCategory, updateChampEvent } from "../../apis";

export const fetchChampionEvents = createAsyncThunk("championEvent/fetchAll", async (category_key) => {
  const response = await getAllChampEventsByCategory(category_key);
  return response.data;
});

// @ts-ignore
export const addChampionEvent = createAsyncThunk("championEvent/add", async ({ formData }) => {
  const response = await createChampEvent(formData);
  return response.data;
});

export const deleteChampionEvent = createAsyncThunk("championEvent/delete", async (id) => {
  await deleteChampEvent(id);
  return id;
});

// @ts-ignore
export const updateChampionEvent = createAsyncThunk("championEvent/update", async ({ id, formData }) => {
  const response = await updateChampEvent(id, formData);
  return response.data;
});

const championEventSlice = createSlice({
  name: "championEvents",
  initialState: {
    data: [],
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
        state.data = action.payload;
      })
      .addCase(fetchChampionEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionEvent.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteChampionEvent.fulfilled, (state, action) => {
        state.data = state.data.filter((group) => group.id !== action.payload);
      })
      .addCase(updateChampionEvent.fulfilled, (state, action) => {
        const index = state.data.findIndex((group) => group.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      });
  },
});

export default championEventSlice.reducer;
