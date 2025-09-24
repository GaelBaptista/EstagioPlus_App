import { Router } from "express";
import AuthController from "./controllers/AuthController";
import * as Catalog from "./controllers/CatalogController";
import * as Loyalty from "./controllers/LoyaltyController";
import ensureAuth from "./middlewares/ensureAuth";

const routes = Router();
const authController = new AuthController();

// Auth
routes.post("/auth/login", (req, res) => authController.login(req, res));
routes.get("/auth/me", ensureAuth, (req, res) => authController.me(req, res));

// Catálogo (público)
routes.get("/catalog/categories", (req, res) => Catalog.getCategories(req, res));
routes.get("/catalog/benefits", (req, res) => Catalog.getBenefits(req, res));
routes.get("/catalog/benefits/:id", (req, res) => Catalog.getBenefitById(req, res));

// Loyalty (protegido)
routes.post("/loyalty/accrue", ensureAuth, (req, res) => Loyalty.accrueToday(req, res));
routes.get("/loyalty/progress", ensureAuth, (req, res) => Loyalty.getProgress(req, res));
routes.post("/loyalty/claim-month", ensureAuth, (req, res) => Loyalty.claimMonthly(req, res));

export default routes;
