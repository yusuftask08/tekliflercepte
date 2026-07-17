"use client";

import { createContext, useContext, useState } from "react";

// Shares `blocked` between the header menu (toggles it) and the thread
// (locks its input while it's true) without prop-drilling through the
// server-rendered layout in between them — the two used to hold this
// state independently, so blocking someone never actually disabled the
// input.
const BlockedContext = createContext(null);

export function BlockedProvider({ initialBlocked, children }) {
  const state = useState(initialBlocked);
  return <BlockedContext.Provider value={state}>{children}</BlockedContext.Provider>;
}

export function useBlocked() {
  return useContext(BlockedContext);
}
