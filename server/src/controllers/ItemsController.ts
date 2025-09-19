import knex from "../database/connection";
import { Request, Response } from "express";

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex("items").select("*");

    const baseUrl = `${request.protocol}://${request.get("host")}`;


    const serialized = items.map((item) => ({
      id: item.id,
      title: item.title,
      image_url: `${baseUrl}/uploads/${item.image}`,
    }));

    return response.json(serialized);
  }
}

export default ItemsController;
