"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { ensureCurrentUserInDbAction } from "@/app/actions/users";

const SESSION_KEY = "dayli-user-db-sync";

/** Stores the signed-in Clerk user in Mongo once per browser tab session. */
export function EnsureUserSynced() {
  const { isSignedIn } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (!isSignedIn) {
      started.current = false;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
      }
      return;
    }
    if (started.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      return;
    }
    started.current = true;
    void ensureCurrentUserInDbAction().then(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    });
  }, [isSignedIn]);

  return null;
}
