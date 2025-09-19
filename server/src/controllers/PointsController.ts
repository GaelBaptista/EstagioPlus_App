import knex from "../database/connection";
import { Request, Response } from "express";

class PointsController {
  async index(request: Request, response: Response): Promise<any> {
    const { city, uf, items } = request.query;

    if (!city || !uf || !items) {
      return response
        .status(400)
        .json({ message: "Parâmetros ausentes para busca." });
    }

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => !isNaN(item));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    return response.json(points);
  }

  async show(request: Request, response: Response): Promise<any> {
    const { id } = request.params;
    const point = await knex("points").where("id", id).first();
    if (!point) {
      return response.status(400).json({ message: "Point not found" });
    }
    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");
    return response.json({ point, items });
  }
  create = async (request: Request, response: Response): Promise<any> => {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } =
      request.body;

    if (
      !name ||
      !email ||
      !whatsapp ||
      !latitude ||
      !longitude ||
      !city ||
      !uf ||
      !items?.length
    ) {
      return response
        .status(400)
        .json({ message: "Dados inválidos no cadastro de ponto" });
    }
    const trx = await knex.transaction();
    const point = {
      image:
        "https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?q=60&w=400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);
    const point_id = insertedIds[0];

    const pointItems = items.map((item_id: number) => ({
      item_id,
      point_id,
    }));

    await trx("point_items").insert(pointItems);
    await trx.commit();
    response.json({ id: point_id, ...point });
  };
}

export default PointsController;
