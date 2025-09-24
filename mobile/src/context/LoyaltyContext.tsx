import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "../services/api";

type Milestone = { pct: number; label: string; reached: boolean };

type LoyaltyState = {
  loading: boolean;
  points: number;
  percent: number;
  meta: number;
  daily_rate: number;
  milestones: Milestone[];
  month_bonus_available: boolean;
  refresh: () => Promise<void>;
  claimMonth: () => Promise<boolean>;
};

const LoyaltyCtx = createContext<LoyaltyState>({} as any);

export const LoyaltyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<Omit<LoyaltyState, "refresh" | "claimMonth">>({
    loading: true,
    points: 0,
    percent: 0,
    meta: 1_000_000,
    daily_rate: 2800,
    milestones: [],
    month_bonus_available: false,
  });

  async function refresh() {
    try {
      setState((s) => ({ ...s, loading: true }));
      // credita diários (idempotente) e busca
      await api.post("/loyalty/accrue");
      const { data } = await api.get("/loyalty/progress");
      setState((s) => ({ ...s, loading: false, ...data }));
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }

  async function claimMonth() {
    try {
      const r = await api.post("/loyalty/claim-month");
      await refresh();
      return !!r.data?.ok;
    } catch {
      return false;
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <LoyaltyCtx.Provider value={{ ...state, refresh, claimMonth }}>
      {children}
    </LoyaltyCtx.Provider>
  );
};

export const useLoyalty = () => useContext(LoyaltyCtx);
