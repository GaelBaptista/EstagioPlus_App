// src/controllers/CatalogController.ts
import { Request, Response } from "express";
import knex from "../database/connection";
import path from "path";
import fs from "fs";

/** Monta a base URL (http://host:port) a partir da request */
function baseUrl(req: Request) {
  return `${req.protocol}://${req.get("host")}`;
}

/** Usa mtime do arquivo como cache-buster */
function fileVersion(p: string) {
  try {
    return Math.floor(fs.statSync(p).mtimeMs);
  } catch {
    return 1;
  }
}

/** ========== CATEGORIAS ========== */
/** GET /catalog/categories  ->  [{ id, label, icon }] */
export async function getCategories(req: Request, res: Response) {
  const items = await knex("items").select("*");

  const cats = items.map((it: any) => {
    const p = path.resolve(__dirname, "..", "uploads", it.image);
    const v = fileVersion(p);
    return {
      id: it.id,
      label: it.title,
      icon: `${baseUrl(req)}/uploads/${it.image}?v=${v}`,
    };
  });

  return res.json(cats);
}

/** ========== HELPERS ONLINE ========== */
function onlineIsAvailable(row: any, state?: string, city?: string) {
  const scope = String(row.availability_scope || "NATIONAL").toUpperCase();

  if (scope === "NATIONAL") return true;

  if (scope === "STATE") {
    if (!state) return false;
    const states = String(row.states || "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    return states.includes(state.toUpperCase());
  }

  if (scope === "CITY") {
    if (!state || !city) return false;
    const pairs = String(row.cities || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean); // "Fortaleza:CE"
    const target = `${city}:${state}`.toUpperCase();
    return pairs.some((p) => p.toUpperCase() === target);
  }

  return false;
}

/** Normaliza um row de POINT para o formato de benefício */
function mapPointToBenefit(origin: string, p: any) {
  return {
    id: `phy-${p.id}`,
    title: p.name,
    partner_name: p.name,
    category_id: p.category_id || null,
    details: undefined,
    discount_label: undefined,
    logo_url: `${origin}/uploads/${(p.image || "").split("/").pop()}`,
    image_url:
      p.image && String(p.image).startsWith("http")
        ? p.image
        : `${origin}/uploads/${p.image || ""}`,
    contact: { phone: p.whatsapp, website: undefined },
    is_online: false,
    availability_scope: "CITY",
    locations: [
      {
        id: `loc-${p.id}`,
        address: `${p.city}`,
        city: p.city,
        state: p.uf,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      },
    ],
  };
}

/** Normaliza um row de ONLINE para o formato de benefício */
function mapOnlineRowToBenefit(origin: string, r: any) {
  const toUrl = (name?: string) => {
    if (!name) return undefined;
    return name.startsWith("http") ? name : `${origin}/uploads/${name}`;
  };

  return {
    id: `onl-${r.id}`,
    title: r.title,
    partner_name: r.partner_name,
    category_id: r.category_id || null,
    details: r.details || undefined,
    discount_label: r.discount_label || undefined,
    logo_url: toUrl(r.logo),
    image_url: toUrl(r.image),
    contact: { phone: r.phone || undefined, website: r.website || undefined },
    is_online: true,
    availability_scope: r.availability_scope || "NATIONAL",
    locations: [] as any[],
  };
}

/** ========== BENEFÍCIOS (lista) ========== */
/**
 * GET /catalog/benefits
 * Query:
 *  - state, city
 *  - categoryId (número)
 *  - onlyOnline=true|false
 *  - onlyPhysical=true|false
 */
export async function getBenefits(req: Request, res: Response) {
  const { state, city, categoryId, onlyOnline, onlyPhysical } = req.query as any;

  const cat = categoryId ? Number(categoryId) : undefined;
  const fo = String(onlyOnline || "").toLowerCase() === "true";
  const fp = String(onlyPhysical || "").toLowerCase() === "true";

  const origin = baseUrl(req);
  const out: any[] = [];

  // FÍSICOS (points)
  if (!fo) {
    const q = knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .join("items", "items.id", "=", "point_items.item_id")
      .modify((qb) => {
        if (city) qb.where("points.city", String(city));
        if (state) qb.where("points.uf", String(state));
        if (cat) qb.where("items.id", cat); // filtro por categoria
      })
      .distinct("points.*", "items.id as category_id", "items.title as category_title");

    const points = await q;
    for (const p of points) {
      out.push(mapPointToBenefit(origin, p));
    }
  }

  // ONLINE (online_benefits)
  if (!fp) {
    const q2 = knex("online_benefits").select("*");
    if (cat) q2.where("category_id", cat);
    const rows = await q2;

    for (const r of rows) {
      if (!onlineIsAvailable(r, state, city)) continue;
      out.push(mapOnlineRowToBenefit(origin, r));
    }
  }

  return res.json(out);
}

/** ========== BENEFÍCIO POR ID ========== */
/**
 * GET /catalog/benefits/:id
 * Aceita ids no formato:
 *  - phy-<id do point>
 *  - onl-<id do online_benefits>
 */
export async function getBenefitById(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const origin = baseUrl(req);

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  // FÍSICO
  if (id.startsWith("phy-")) {
    const rawId = Number(id.replace("phy-", ""));
    if (!Number.isFinite(rawId)) {
      return res.status(400).json({ message: "ID físico inválido" });
    }

    // Busca o point + uma categoria associada (se houver)
    const p = await knex("points")
      .leftJoin("point_items", "points.id", "=", "point_items.point_id")
      .leftJoin("items", "items.id", "=", "point_items.item_id")
      .where("points.id", rawId)
      .select("points.*", "items.id as category_id")
      .first();

    if (!p) return res.status(404).json({ message: "Benefício físico não encontrado" });

    const benefit = mapPointToBenefit(origin, p);
    return res.json(benefit);
  }

  // ONLINE
  if (id.startsWith("onl-")) {
    const rawId = Number(id.replace("onl-", ""));
    if (!Number.isFinite(rawId)) {
      return res.status(400).json({ message: "ID online inválido" });
    }

    const r = await knex("online_benefits").where("id", rawId).first();
    if (!r) return res.status(404).json({ message: "Benefício online não encontrado" });

    const benefit = mapOnlineRowToBenefit(origin, r);
    return res.json(benefit);
  }

  return res.status(400).json({ message: "Formato de ID desconhecido" });
}

/** ========== RECOMENDADOS (SEM MOCK, SÓ BANCO) ========== */
/**
 * GET /catalog/recommended?state=CE&city=Pacajus&limit=8
 * Retorna APENAS benefícios existentes no banco.
 * Aqui destacamos, por exemplo:
 *  - "Minicursos IGT" (Educação)
 *  - "Atendimento Psicológico Online" (Eliene Duarte) (Saúde)
 * Ajuste os termos se usar títulos/nomes diferentes no seed.
 */
export async function getRecommended(req: Request, res: Response) {
  const { state, city, limit } = req.query as any;
  const origin = baseUrl(req);

  // Busca estritamente por esses benefícios reais do seed
  const rows = await knex("online_benefits")
    .where(function () {
      this.whereLike("title", "%Minicursos IGT%")
        .orWhereLike("title", "%IGT%")
        .orWhereLike("partner_name", "%IGT%");
    })
    .orWhere(function () {
      this.whereLike("title", "%Psicol%")
        .orWhereLike("partner_name", "%Eliene Duarte%");
    })
    .select("*");

  const picked = rows
    .filter((r) => onlineIsAvailable(r, state, city))
    .map((r) => mapOnlineRowToBenefit(origin, r));

  const lim = Number(limit || 8);
  return res.json(picked.slice(0, Math.max(0, lim)));
}
