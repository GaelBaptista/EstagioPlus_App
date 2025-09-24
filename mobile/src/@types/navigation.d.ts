// src/@types/navigation.d.ts
import type { BenefitItem, LocationItem } from "../types/domain";

export type RootStackParamList = {
  Login: undefined;
  ChooseLocation: undefined;
  HomeLoyalty: undefined;
  Points: { uf: string; city: string };
  Results: { state: string; city: string; categoryId?: number };
  Details: { benefit: BenefitItem; location?: LocationItem };
   Wallet: undefined;
};
