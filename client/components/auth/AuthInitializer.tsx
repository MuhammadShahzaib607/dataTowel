"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { restoreUser, setInitialized } from "@/lib/store/authSlice";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Skip if already authenticated or initialized — prevents race with
    // Google login (which stores the JWT + sets isAuthenticated before this
    // component runs on remount)
    if (isAuthenticated || isInitialized) return;

    // Check localStorage directly — not Redux state (which always starts null)
    const storedToken = localStorage.getItem("datatowel_token");
    if (storedToken) {
      // restoreUser will set isInitialized = true on fulfilled/rejected
      dispatch(restoreUser());
    } else {
      // No token — user is not authenticated, mark as initialized immediately
      dispatch(setInitialized());
    }
  }, [dispatch, isAuthenticated, isInitialized]);

  return null;
}
