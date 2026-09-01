"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { restoreUser, setInitialized } from "@/lib/store/authSlice";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { token, isInitialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      // restoreUser will set isInitialized = true on fulfilled/rejected
      dispatch(restoreUser());
    } else {
      // No token — user is not authenticated, mark as initialized immediately
      dispatch(setInitialized());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
