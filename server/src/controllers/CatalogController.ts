import knex from "../database/connection";
import { Request, Response } from "express";

// Haversine simples (em metros)
function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const s = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

class CatalogController {
  // GET /catalog/categories  (usa tabela "items")
  async categories(req: Request, res: Response) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const items = await knex("items").select("*");
    // renomeia semanticamente para categorias
    const categories = items.map((it: any) => ({
      id: it.id,
      label: it.title,
      icon: `${baseUrl}/uploads/${it.image}`, // reaproveita svgs existentes
    }));
    return res.json(categories);
  }

  // GET /catalog/benefits?state=UF&city=Nome&lat&lng&radius&categoryId
  async benefits(req: Request, res: Response) {
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const radius = req.query.radius ? Number(req.query.radius) : 80000; // 80km default p/ teste
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const state = (req.query.state as string) || (req.query.uf as string) || undefined;
    const city = (req.query.city as string) || undefined;

    // base: points (locais) + (opcional) filtro por categoria via point_items
    let query = knex("points").select("points.*");

    if (categoryId) {
      query = query
        .join("point_items", "points.id", "=", "point_items.point_id")
        .where("point_items.item_id", categoryId)
        .distinct();
    }

    if (state) query = query.where("uf", state);
    if (city) query = query.where("city", city);

    const points = await query;

    const benefits = points
      .map((p: any) => {
        const benefit = {
          id: String(p.id),
          title: p.name, // título do benefício (usa 'name' do ponto/parceiro)
          partner_name: p.name,
          category_id: categoryId ?? null, // se quiser pode preencher depois
          details: undefined,
          discount_label: undefined,
          logo_url: undefined,
          image_url: p.image, // no Ecoleta já usa URL absoluta
          contact: { phone: p.whatsapp, website: undefined },
          locations: [
            {
              id: `loc-${p.id}`,
              address: "Endereço informado no app", // não temos na tabela — mantemos placeholder
              city: p.city,
              state: p.uf,
              latitude: Number(p.latitude),
              longitude: Number(p.longitude),
              // distance_m: calculado abaixo se lat/lng vierem
            },
          ],
        };

        if (lat !== undefined && lng !== undefined) {
          const d = distanceMeters(
            { lat, lng },
            { lat: Number(p.latitude), lng: Number(p.longitude) }
          );
          (benefit.locations[0] as any).distance_m = d;
          if (radius && d > radius) return null; // fora do raio
        }

        return benefit;
      })
      .filter(Boolean);

    // ordenar por distância se houver
    if (lat !== undefined && lng !== undefined) {
      (benefits as any).sort(
        (a: any, b: any) => (a.locations[0].distance_m || 0) - (b.locations[0].distance_m || 0)
      );
    }

    return res.json(benefits);
  }

  // (opcional) GET /catalog/benefits/:id
  async benefitById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const p = await knex("points").where("id", id).first();
    if (!p) return res.status(404).json({ error: "not found" });

    const benefit = {
      id: String(p.id),
      title: p.name,
      partner_name: p.name,
      category_id: null,
      details: undefined,
      discount_label: undefined,
      logo_url: undefined,
      image_url: p.image,
      contact: { phone: p.whatsapp, website: undefined },
      locations: [
        {
          id: `loc-${p.id}`,
          address: "Endereço informado no app",
          city: p.city,
          state: p.uf,
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
        },
      ],
    };
    return res.json(benefit);
  }
}

export default CatalogController;
