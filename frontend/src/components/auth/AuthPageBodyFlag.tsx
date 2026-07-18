"use client";

import { useEffect } from "react";

/** Adds body class so login-only styles apply (footer hide fallback). */
export function AuthPageBodyFlag() {
  useEffect(() => {
    document.body.classList.add("auth-login-active");
    const main = document.querySelector("main");
    main?.classList.add("auth-login-main");

    return () => {
      document.body.classList.remove("auth-login-active");
      main?.classList.remove("auth-login-main");
    };
  }, []);

  return null;
}
