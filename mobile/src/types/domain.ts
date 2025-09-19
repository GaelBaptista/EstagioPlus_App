// src/types/domain.ts
export type LocationItem = {
  id: string;
  address: string;
  city: string;
  state: string;     // UF
  latitude: number;
  longitude: number;
  distance_m?: number;
};

export type BenefitItem = {
  id: string;
  title: string;
  partner_name: string;
  category_id: number | null;
  details?: string;
  discount_label?: string;
  logo_url?: string;
  image_url?: string;
  contact?: { phone?: string; website?: string };
  locations: LocationItem[];
};

export type CategoryItem = {
  id: number;
  label: string;
  icon?: string; // URL (SVG ou imagem)
};
