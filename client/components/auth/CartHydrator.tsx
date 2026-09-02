"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hydrateCart } from "@/lib/store/cartSlice";

export default function CartHydrator() {
  const dispatch = useAppDispatch();
  const loaded = useAppSelector((state) => state.cart._loaded);

  useEffect(() => {
    if (!loaded) {
      dispatch(hydrateCart());
    }
  }, [loaded, dispatch]);

  return null;
}
