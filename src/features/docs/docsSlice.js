import { createSlice } from '@reduxjs/toolkit';

const docsSlice = createSlice({
  name: 'docs',
  initialState: {
    currentDoc: null,
    sidebarOpen: true,
    tableOfContents: [],
  },
  reducers: {
    setCurrentDoc: (state, action) => {
      state.currentDoc = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTableOfContents: (state, action) => {
      state.tableOfContents = action.payload;
    },
  },
});

export const { setCurrentDoc, toggleSidebar, setSidebarOpen, setTableOfContents } = docsSlice.actions;
export default docsSlice.reducer;
