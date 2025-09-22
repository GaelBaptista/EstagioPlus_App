// src/controllers/AuthController.ts
import { Request, Response } from "express";
import knex from "../database/connection";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import type { StringValue as MsStringValue } from "ms"; // 👈 tipo aceito por expiresIn

// Helpers para ENV
const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_secret_estagioplus";
const RAW_JWT_EXPIRES: string = process.env.JWT_EXPIRES || "1d";

// Converte "1d" | "2h" | "3600" -> tipo aceito pelo jsonwebtoken
function toExpiresIn(v: string): number | MsStringValue {
  // se for só número, vira number; caso contrário, assume string estilo "1d"
  return /^\d+$/.test(v) ? Number(v) : (v as MsStringValue);
}

const EXPIRES_IN: number | MsStringValue = toExpiresIn(RAW_JWT_EXPIRES);

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    const exists = await knex("users").where({ email }).first();
    if (exists) return res.status(409).json({ error: "E-mail já cadastrado" });

    const passwordHash = await bcrypt.hash(String(password), 10);

    const [id] = await knex("users").insert({ email, password: passwordHash, name });

    const options: SignOptions = { expiresIn: EXPIRES_IN }; // ✅ tipado corretamente
    const token = jwt.sign({ id, email }, JWT_SECRET, options);

    return res.status(201).json({
      user: { id, email, name: name ?? null },
      token,
    });
  } catch (err) {
    console.error("[AuthController.register]", err);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    const user = await knex("users").where({ email }).first();
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const options: SignOptions = { expiresIn: EXPIRES_IN }; 
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, options);

    return res.json({
      user: { id: user.id, email: user.email, name: user.name ?? null },
      token,
    });
  } catch (err) {
    console.error("[AuthController.login]", err);
    return res.status(500).json({ error: "Erro ao realizar login" });
  }
}

export async function profile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    const user = await knex("users").where({ id: userId }).first();
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error("[AuthController.profile]", err);
    return res.status(500).json({ error: "Erro ao carregar perfil" });
  }
}
