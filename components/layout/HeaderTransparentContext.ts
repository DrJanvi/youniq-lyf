"use client";

import { createContext, useContext } from "react";

// null means "not inside the header"; SearchBar then falls back to its own logic.
export const HeaderTransparentContext = createContext<boolean | null>(null);

export const useHeaderTransparent = () => useContext(HeaderTransparentContext);
