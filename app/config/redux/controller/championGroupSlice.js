import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createChampGroup, deleteChampGroup, getAllChampGroups, getChampGroupsByChampId, updateChampGroup } from "../../apis";

export const fetchChampionGroups = createAsyncThunk("championGroups/fetchAll", async (champId) => {
  // @ts-ignore
  const response = champId ? await getChampGroupsByChampId(champId) : await getAllChampGroups();
  return response.data;
});

// @ts-ignore
export const addChampionGroup = createAsyncThunk("championGroups/add", async ({ formData }) => {
  const response = await createChampGroup(formData);
  return response.data;
});

export const deleteChampionGroup = createAsyncThunk("championGroups/delete", async (id) => {
  await deleteChampGroup(id);
  return id;
});

// @ts-ignore
export const updateChampionGroup = createAsyncThunk("championGroups/update", async ({ id, formData }) => {
  const response = await updateChampGroup(id, formData);
  return response.data;
});

const championGroupSlice = createSlice({
  name: "championGroups",
  initialState: {
    data: [],
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
        state.data = action.payload;
      })
      .addCase(fetchChampionGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionGroup.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteChampionGroup.fulfilled, (state, action) => {
        state.data = state.data.filter((group) => group.id !== action.payload);
      })
      .addCase(updateChampionGroup.fulfilled, (state, action) => {
        const index = state.data.findIndex((group) => group.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      });
  },
});

export default championGroupSlice.reducer;
