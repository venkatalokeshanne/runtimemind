import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@/features/theme/themeSlice';
import docsReducer from '@/features/docs/docsSlice';
import searchReducer from '@/features/search/searchSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    docs: docsReducer,
    search: searchReducer,
  },
});
