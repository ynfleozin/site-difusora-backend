import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (!SECRET_KEY) {
    console.error("Chave JWT secreta не definida no ambiente.");
    return res.status(500).json({ message: "Erro interno do servidor." });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (ex) {
    return res.status(400).json({ message: "Token inválido ou expirado." });
  }
}
