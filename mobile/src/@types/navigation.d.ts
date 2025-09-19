// src/@types/navigation.d.ts
import type { BenefitItem, LocationItem } from "../types/domain";

export type RootStackParamList = {
  Home: undefined;
  Points: { uf: string; city: string };
  Details: { benefit: BenefitItem; location?: LocationItem };
};
