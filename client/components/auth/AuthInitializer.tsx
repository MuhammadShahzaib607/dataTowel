"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { restoreUser } from "@/lib/store/authSlice";

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(restoreUser());
    }
  }, [dispatch, token]);

  return null;
}
