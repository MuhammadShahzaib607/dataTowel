"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Mail, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendOtp,
  clearAuthError,
  setPendingVerificationEmail,
} from "@/lib/store/authSlice";
import {
  closeAuthModal,
  setAuthModalMode,
} from "@/lib/store/uiSlice";

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const { authModalOpen, authModalMode } = useAppSelector((state) => state.ui);
  const { isLoading, error, pendingVerificationEmail } = useAppSelector(
    (state) => state.auth
  );

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [validationError, setValidationError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const isLogin = authModalMode === "login";
  const isSignup = authModalMode === "signup";
  const isVerify = authModalMode === "verify-email";

  // Prevent background scrolling
  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [authModalOpen]);

  // ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && authModalOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [authModalOpen]);

  // Clear errors when switching modes
  useEffect(() => {
    setValidationError("");
    dispatch(clearAuthError());
  }, [authModalMode, dispatch]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleClose = useCallback(() => {
    dispatch(closeAuthModal());
    setUsername("");
    setEmail("");
    setPassword("");
    setOtp("");
    setValidationError("");
    setResendCooldown(0);
    dispatch(clearAuthError());
    dispatch(setPendingVerificationEmail(null));
  }, [dispatch]);

  const switchMode = () => {
    dispatch(setAuthModalMode(isLogin ? "signup" : "login"));
  };

  const goToVerify = (verifyEmail: string) => {
    setEmail(verifyEmail);
    dispatch(setAuthModalMode("verify-email"));
  };

  const validate = (): boolean => {
    if (isLogin) {
      if (!email.trim()) {
        setValidationError("Please enter your email.");
        return false;
      }
      if (!password) {
        setValidationError("Please enter your password.");
        return false;
      }
    } else if (isSignup) {
      if (!username.trim()) {
        setValidationError("Please enter your username.");
        return false;
      }
      if (!email.trim()) {
        setValidationError("Please enter your email.");
        return false;
      }
      if (!password) {
        setValidationError("Please enter your password.");
        return false;
      }
      if (password.length < 6) {
        setValidationError("Password must be at least 6 characters.");
        return false;
      }
    } else if (isVerify) {
      if (!otp.trim()) {
        setValidationError("Please enter the verification code.");
        return false;
      }
      if (otp.trim().length !== 6) {
        setValidationError("Verification code must be 6 digits.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    dispatch(clearAuthError());

    if (!validate()) return;

    if (isLogin) {
      const result = await dispatch(
        loginUser({ email: email.trim(), password })
      );
      if (loginUser.fulfilled.match(result)) {
        handleClose();
      } else if (loginUser.rejected.match(result)) {
        const payload = result.payload as
          | { message: string; code?: string }
          | undefined;
        if (payload?.code === "EMAIL_NOT_VERIFIED") {
          goToVerify(email.trim());
        }
      }
    } else if (isSignup) {
      const result = await dispatch(
        registerUser({
          username: username.trim(),
          email: email.trim(),
          password,
        })
      );
      if (registerUser.fulfilled.match(result)) {
        goToVerify(email.trim());
        setResendCooldown(30);
      }
    } else if (isVerify) {
      const result = await dispatch(
        verifyEmail({
          email: email || pendingVerificationEmail || "",
          otp: otp.trim(),
        })
      );
      if (verifyEmail.fulfilled.match(result)) {
        handleClose();
      }
    }
  };

  const handleResend = async () => {
    const resendEmail = email || pendingVerificationEmail || "";
    if (!resendEmail || resendCooldown > 0) return;
    setValidationError("");
    dispatch(clearAuthError());
    const result = await dispatch(resendOtp({ email: resendEmail }));
    if (resendOtp.fulfilled.match(result)) {
      setResendCooldown(30);
    }
  };

  const displayError = validationError || error;

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <div
              className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] transition-colors z-10 cursor-pointer"
                aria-label="Close"
              >
                <X size={20} strokeWidth={1.5} />
              </button>

              {/* Header */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-2">
                  {isVerify && (
                    <button
                      onClick={() => {
                        dispatch(setAuthModalMode("signup"));
                        setOtp("");
                        setValidationError("");
                        dispatch(clearAuthError());
                        dispatch(setPendingVerificationEmail(null));
                      }}
                      className="w-8 h-8 flex items-center justify-center text-[#6F6F69] hover:text-[#171717] transition-colors cursor-pointer -ml-1"
                      aria-label="Back"
                    >
                      <ArrowLeft size={18} strokeWidth={1.5} />
                    </button>
                  )}
                  <h2 className="text-[22px] font-semibold text-[#171717] tracking-tight">
                    {isLogin && "Welcome back"}
                    {isSignup && "Create your account"}
                    {isVerify && "Verify Your Email"}
                  </h2>
                </div>
                <p className="mt-1.5 text-[13px] text-[#6F6F69]">
                  {isLogin && "Sign in to access your account"}
                  {isSignup && "Join DataTowel to get started"}
                  {isVerify &&
                    `We've sent a 6-digit verification code to ${email || pendingVerificationEmail}`}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-8">
                {isVerify ? (
                  /* Verify email inputs */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] focus:border-transparent transition-all text-center tracking-[0.3em] text-[18px] font-medium"
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                  </div>
                ) : (
                  /* Login / Signup inputs */
                  <div className="space-y-4">
                    {isSignup && (
                      <div>
                        <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] focus:border-transparent transition-all"
                          placeholder="Your name"
                          autoComplete="name"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] focus:border-transparent transition-all"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[#6F6F69] mb-1.5 uppercase tracking-wider">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-[#E8E6DF] bg-[#FAFAF7] text-[14px] text-[#171717] placeholder-[#96958D] focus:outline-none focus:ring-2 focus:ring-[#D8CBB8] focus:border-transparent transition-all"
                        placeholder={
                          isLogin ? "Your password" : "Min 6 characters"
                        }
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {displayError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-[13px] text-red-500"
                  >
                    {displayError}
                  </motion.p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full h-12 rounded-lg bg-[#171717] text-white text-[14px] font-medium tracking-wide hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>
                        {isLogin && "Signing in..."}
                        {isSignup && "Creating account..."}
                        {isVerify && "Verifying..."}
                      </span>
                    </>
                  ) : (
                    <span>
                      {isLogin && "Sign In"}
                      {isSignup && "Create Account"}
                      {isVerify && "Verify Email"}
                    </span>
                  )}
                </button>

                {/* Bottom actions */}
                {isVerify ? (
                  <div className="mt-5 space-y-3">
                    {/* Spam note */}
                    <p className="text-[12px] text-[#96958D] text-center">
                      Can&rsquo;t find the email? Please check your{" "}
                      <span className="font-medium text-[#6F6F69]">
                        Spam or Junk folder
                      </span>
                      .
                    </p>

                    {/* Resend */}
                    <p className="text-center text-[13px] text-[#6F6F69]">
                      Didn&rsquo;t receive the code?{" "}
                      {resendCooldown > 0 ? (
                        <span className="text-[#96958D]">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={isLoading}
                          className="text-[#171717] font-medium hover:underline underline-offset-2 cursor-pointer disabled:opacity-50"
                        >
                          Resend Code
                        </button>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 text-center text-[13px] text-[#6F6F69]">
                    {isLogin
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-[#171717] font-medium hover:underline underline-offset-2 cursor-pointer"
                    >
                      {isLogin ? "Join" : "Sign In"}
                    </button>
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
