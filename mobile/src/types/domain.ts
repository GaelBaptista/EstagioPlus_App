// src/types/domain.ts
export type Category = {
  id: number;
  label: string;
  icon: string; // url do svg
};

export type LocationItem = {
  id: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  address?: string;
};

export type BenefitItem = {
  id: string;               // "phy-1" ou "onl-3"
  title: string;
  partner_name?: string;
  details?: string;
  discount_label?: string;
  image_url?: string;
  logo_url?: string;
  contact?: { phone?: string; website?: string; email?: string };
  is_online: boolean;
  category_id?: number | null;
  locations: LocationItem[];
};


export type CategoryItem = Category; // alias simples