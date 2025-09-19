import { Router } from "express";

import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";
import CatalogController from "./controllers/CatalogController";

const routes = Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();
const catalogController = new CatalogController();

// Rotas novas (Estágio Plus)
routes.get("/catalog/categories", (req, res) => catalogController.categories(req, res));
routes.get("/catalog/benefits", (req, res) => catalogController.benefits(req, res));
routes.get("/catalog/benefits/:id", (req, res) => catalogController.benefitById(req, res));

// Rotas antigas do Ecoleta (mantidas)
routes.get("/items", (req, res) => itemsController.index(req, res));
routes.post("/points", (req, res) => pointsController.create(req, res));
routes.get("/points", (req, res) => pointsController.index(req, res));
routes.get("/points/:id", (req, res) => pointsController.show(req, res));

export default routes;
