import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthModalMode = "login" | "signup" | "verify-email";

interface UiState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  scrolled: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  profileDropdownOpen: boolean;
}

const initialState: UiState = {
  mobileMenuOpen: false,
  searchOpen: false,
  scrolled: false,
  authModalOpen: false,
  authModalMode: "login",
  profileDropdownOpen: false,
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
    openAuthModal(state, action: PayloadAction<AuthModalMode>) {
      state.authModalOpen = true;
      state.authModalMode = action.payload;
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
    },
    setAuthModalMode(state, action: PayloadAction<AuthModalMode>) {
      state.authModalMode = action.payload;
    },
    toggleProfileDropdown(state) {
      state.profileDropdownOpen = !state.profileDropdownOpen;
    },
    closeProfileDropdown(state) {
      state.profileDropdownOpen = false;
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearch,
  closeSearch,
  setScrolled,
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  toggleProfileDropdown,
  closeProfileDropdown,
} = uiSlice.actions;
export default uiSlice.reducer;
