import { Router, Request, Response } from "express";
import { loginUser } from "../../services/authService";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Usuário e senha são obrigatórios." });
  }

  const token = await loginUser(username, password);

  if (!token) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  return res.json({ token });
});

export default router;
