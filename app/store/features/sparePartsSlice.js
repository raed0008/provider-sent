import { createSlice } from "@reduxjs/toolkit";

const sparePartsSlice = createSlice({
  name: "spareParts",
  initialState: { temp: {} },
  reducers: {
    saveSparePartTemp: (state, action) => {
      state.temp = { ...state.temp, ...action.payload };
    },
    clearSparePartTemp: (state) => {
      state.temp = {};
    },
  },
});

export const { saveSparePartTemp, clearSparePartTemp } = sparePartsSlice.actions;
export default sparePartsSlice.reducer;
