// src/types/domain.ts
export type CategoryItem = {
  id: number;
  label: string;
  icon?: string; // pode vir do backend (svg/png) — opcional
};

export type LocationItem = {
  id: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
};

export type BenefitItem = {
  id: string; // "phy-<id>" ou "onl-<id>"
  title?: string;
  partner_name?: string;
  category_id?: number | null;
  details?: string;
  discount_label?: string;
  logo_url?: string;
  image_url?: string;
  contact?: { phone?: string; website?: string };
  is_online: boolean;
  availability_scope?: "NATIONAL" | "STATE" | "CITY";
  locations?: LocationItem[];
};

export type User = {
  id?: number;
  name: string;
  email: string;
  cpf?: string;
  points?: number;
  nextLevel?: number;
  level?: string;
  avatar_url?: string | null;
  token?: string;
};
