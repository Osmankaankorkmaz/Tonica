"use client";

import { useEffect } from "react";

export default function AiStateResetOnReload() {
  useEffect(() => {
    try {
      localStorage.removeItem("tonica_ai_state_v1");
    } catch {
        
    }
  }, []);

  return null;
}
