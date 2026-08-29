import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  scrolled: boolean;
}

const initialState: UiState = {
  mobileMenuOpen: false,
  searchOpen: false,
  scrolled: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    closeSearch(state) {
      state.searchOpen = false;
    },
    setScrolled(state, action: PayloadAction<boolean>) {
      state.scrolled = action.payload;
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearch,
  closeSearch,
  setScrolled,
} = uiSlice.actions;
export default uiSlice.reducer;
