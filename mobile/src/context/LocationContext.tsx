// src/context/LocationContext.tsx
import React, { createContext, useContext, useState } from "react";

type Loc = { state?: string; city?: string };
type Ctx = { location: Loc; setLocation: (loc: Loc) => void };

const LocationContext = createContext<Ctx>({} as any);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Loc>({ state: "CE", city: "Pacajus" });
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export function useLocationCtx() {
  return useContext(LocationContext);
}
