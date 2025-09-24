// src/middlewares/ensureAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export default function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Token ausente" });

  const [scheme, token] = auth.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Token inválido" });

  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;
    // usamos o subject (sub) como id
    (req as any).userId = decoded.sub ? Number(decoded.sub) : undefined;
    if (!(req as any).userId) return res.status(401).json({ message: "Token inválido" });
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
