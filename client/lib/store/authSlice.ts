import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, apiRequestRaw } from "@/lib/api";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("datatowel_token") : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingVerificationEmail: null,
};

interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  token?: string;
  needsVerification?: boolean;
  code?: string;
}

interface MeResponse {
  success: boolean;
  user: AuthUser;
}

// Register
export const registerUser = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const data = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: userData,
    });
    // No token yet — needs verification
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Registration failed");
  }
});

// Login
export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: { message: string; code?: string } }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await apiRequestRaw<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
    });

    if (data._status === 200 && data.token) {
      localStorage.setItem("datatowel_token", data.token);
      return data;
    }

    return rejectWithValue({
      message: data.message || "Login failed",
      code: data.code,
    });
  } catch (err) {
    return rejectWithValue({
      message: err instanceof Error ? err.message : "Login failed",
    });
  }
});

// Verify email
export const verifyEmail = createAsyncThunk<
  AuthResponse,
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyEmail", async ({ email, otp }, { rejectWithValue }) => {
  try {
    const data = await apiRequest<AuthResponse>("/auth/verify-email", {
      method: "POST",
      body: { email, otp },
    });
    if (data.token) {
      localStorage.setItem("datatowel_token", data.token);
    }
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Verification failed");
  }
});

// Resend OTP
export const resendOtp = createAsyncThunk<
  { success: boolean; message: string },
  { email: string },
  { rejectValue: string }
>("auth/resendOtp", async ({ email }, { rejectWithValue }) => {
  try {
    const data = await apiRequest<{ success: boolean; message: string }>("/auth/resend-otp", {
      method: "POST",
      body: { email },
    });
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to resend code");
  }
});

// Google Login
export const googleLoginUser = createAsyncThunk<
  AuthResponse,
  { idToken: string },
  { rejectValue: string }
>("auth/googleLogin", async ({ idToken }, { rejectWithValue }) => {
  try {
    const data = await apiRequest<AuthResponse>("/auth/google", {
      method: "POST",
      body: { idToken },
    });
    if (data.token) {
      localStorage.setItem("datatowel_token", data.token);
    }
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Google sign-in failed");
  }
});

// Restore user from token
export const restoreUser = createAsyncThunk<
  MeResponse,
  void,
  { rejectValue: string }
>("auth/restoreUser", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("datatowel_token");
    if (!token) return rejectWithValue("No token found");

    const data = await apiRequest<MeResponse>("/auth/me", { token });
    return data;
  } catch {
    localStorage.removeItem("datatowel_token");
    return rejectWithValue("Session expired");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.pendingVerificationEmail = null;
      localStorage.removeItem("datatowel_token");
    },
    clearAuthError(state) {
      state.error = null;
    },
    setPendingVerificationEmail(state, action) {
      state.pendingVerificationEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // No token — needs verification
        state.pendingVerificationEmail = action.meta.arg.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        if (typeof payload === "string") {
          state.error = payload;
        } else if (payload && typeof payload === "object") {
          state.error = payload.message;
          // If EMAIL_NOT_VERIFIED, set pending email for verification UI
          if (payload.code === "EMAIL_NOT_VERIFIED") {
            const arg = action.meta.arg as { email: string } | undefined;
            if (arg?.email) {
              state.pendingVerificationEmail = arg.email;
            }
          }
        } else {
          state.error = "Login failed";
        }
      });

    // Verify email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.pendingVerificationEmail = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Verification failed";
      });

    // Resend OTP
    builder
      .addCase(resendOtp.pending, (state) => {
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload || "Failed to resend code";
      });

    // Google Login
    builder
      .addCase(googleLoginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Google sign-in failed";
      });

    // Restore user
    builder
      .addCase(restoreUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(restoreUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError, setPendingVerificationEmail } = authSlice.actions;
export default authSlice.reducer;
