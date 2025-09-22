import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev_secret_estagioplus";

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Token ausente" });

  const [, token] = auth.split(" ");
  try {
    const decoded = jwt.verify(token, SECRET) as { id: number; email: string };
    // você pode anexar no req se quiser:
    (req as any).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
