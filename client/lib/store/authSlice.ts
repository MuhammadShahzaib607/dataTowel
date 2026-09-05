import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest, apiRequestRaw } from "@/lib/api";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  country?: string;
  profileImage?: string;
  isAdmin: boolean;
  isVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  pendingVerificationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  // Always start with null token. AuthInitializer hydrates on client after mount.
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
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
  token?: string;
}

interface ProfileResponse {
  success: boolean;
  user: AuthUser;
}

interface ImageUploadResponse {
  success: boolean;
  profileImage: string;
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
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    console.log("[Google Auth] API URL:", `${API_URL}/auth/google`);
    console.log("[Google Auth] Sending ID token to backend...");
    const data = await apiRequest<AuthResponse>("/auth/google", {
      method: "POST",
      body: { idToken },
    });
    console.log("[Google Auth] Backend response success:", data.success);
    if (data.token) {
      localStorage.setItem("datatowel_token", data.token);
      console.log("[Google Auth] JWT stored in localStorage");
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google sign-in failed";
    console.error("[Google Auth] Backend request failed:", message);
    // Provide a more helpful error message for network failures
    if (message === "Failed to fetch") {
      return rejectWithValue("Unable to connect to the authentication server. Please check your connection.");
    }
    return rejectWithValue(message);
  }
});

// Restore user from token
export const restoreUser = createAsyncThunk<
  MeResponse & { token: string },
  void,
  { rejectValue: string }
>("auth/restoreUser", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("datatowel_token");
    if (!token) return rejectWithValue("No token found");

    const data = await apiRequest<MeResponse>("/auth/me", { token });
    return { ...data, token };
  } catch {
    localStorage.removeItem("datatowel_token");
    return rejectWithValue("Session expired");
  }
});

// Update profile
export const updateProfile = createAsyncThunk<
  ProfileResponse,
  { firstName?: string; lastName?: string; phone?: string; city?: string; country?: string },
  { rejectValue: string }
>("auth/updateProfile", async (profileData, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;
    const data = await apiRequest<ProfileResponse>("/users/profile", {
      method: "PUT",
      body: profileData,
      token: token || undefined,
    });
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to update profile");
  }
});

// Upload profile image
export const uploadProfileImage = createAsyncThunk<
  ImageUploadResponse,
  { file: File },
  { rejectValue: string }
>("auth/uploadProfileImage", async ({ file }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;

    const formData = new FormData();
    formData.append("profileImage", file);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_BASE_URL}/users/profile/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to upload image");
    }
    return data as ImageUploadResponse;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to upload image");
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
      state.isInitialized = true;
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
    updateUserFields(state, action) {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    setInitialized(state) {
      state.isInitialized = true;
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
        state.isInitialized = true;
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
        state.isInitialized = true;
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
        state.isInitialized = true;
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
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(restoreUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile";
      });

    // Upload profile image
    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to upload image";
      });
  },
});

export const { logout, clearAuthError, setPendingVerificationEmail, updateUserFields, setInitialized } = authSlice.actions;
export default authSlice.reducer;
