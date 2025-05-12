import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createChampGrpEvent, deleteChampGrpEvent, getChampGrpEvents, updateChampGrpEvent } from "../../apis";

export const fetchChampionEventGroups = createAsyncThunk("championEventGroup/fetchAll", async (params) => {
  const response = await getChampGrpEvents(params);
  return response.data;
});

// @ts-ignore
export const addChampionEventGroup = createAsyncThunk("championEventGroup/add", async ({ formData }) => {
  const response = await createChampGrpEvent(formData);
  return response.data;
});

export const deleteChampionEventGroup = createAsyncThunk("championEventGroup/delete", async (id) => {
  await deleteChampGrpEvent(id);
  return id;
});

// @ts-ignore
export const updateChampionEventGroup = createAsyncThunk("championEventGroup/update", async ({ id, formData }) => {
  const response = await updateChampGrpEvent(id, formData);
  return response.data;
});

const championEventGroupslice = createSlice({
  name: "championEventGroups",
  initialState: {
    data: [],
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
        state.data = action.payload;
      })
      .addCase(fetchChampionEventGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addChampionEventGroup.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteChampionEventGroup.fulfilled, (state, action) => {
        state.data = state.data.filter((group) => group.champ_grp_event_id !== action.payload);
      })
      .addCase(updateChampionEventGroup.fulfilled, (state, action) => {
        const index = state.data.findIndex((group) => group.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      });
  },
});

export default championEventGroupslice.reducer;
