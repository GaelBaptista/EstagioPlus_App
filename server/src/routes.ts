import { Router } from "express";

import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";
import { getCategories, getBenefits, getBenefitById } from "./controllers/CatalogController";
import { login, register } from "./controllers/AuthController";
// import { ensureAuth } from "./middlewares/ensureAuth";

const routes = Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();

// Auth
routes.post("/auth/register", register);
routes.post("/auth/login", login);

// Catálogo (público ou protegido, como preferir)
// routes.get("/catalog/categories", ensureAuth, getCategories);
routes.get("/catalog/categories", getCategories);
// routes.get("/catalog/benefits", ensureAuth, getBenefits);
routes.get("/catalog/benefits", getBenefits);
routes.get("/catalog/benefits/:id", getBenefitById);

// Legado Ecoleta
routes.get("/items", (req, res) => itemsController.index(req, res));
routes.post("/points", (req, res) => pointsController.create(req, res));
routes.get("/points", (req, res) => pointsController.index(req, res));
routes.get("/points/:id", (req, res) => pointsController.show(req, res));

export default routes;
