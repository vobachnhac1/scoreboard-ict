import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllChamp, createChamp, updateChamp, deleteChamp } from "../../apis";

export const fetchChampions = createAsyncThunk("champions/fetchAll", async (params) => {
  const response = await getAllChamp(params);
  return response.data;
});

export const addChampion = createAsyncThunk("champions/add", async (newChampion) => {
  const response = await createChamp(newChampion);
  return response.data;
});

export const deleteChampion = createAsyncThunk("champions/delete", async (id) => {
  await deleteChamp(id);
  return id;
});

// @ts-ignore
export const updateChampion = createAsyncThunk("champions/update", async ({ id, formData }) => {
  const response = await updateChamp(id, formData);
  return response.data;
});

const championSlice = createSlice({
  name: "champions",
  initialState: {
    data: [],
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
        state.data = action.payload;
      })
      .addCase(fetchChampions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampion.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteChampion.fulfilled, (state, action) => {
        state.data = state.data.filter((champion) => champion.id !== action.payload);
      })
      .addCase(updateChampion.fulfilled, (state, action) => {
        const index = state.data.findIndex((champion) => champion.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      });
  },
});

export default championSlice.reducer;
