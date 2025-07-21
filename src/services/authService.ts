import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function loginUser(
  username: string,
  password: string
): Promise<string | null> {
  if (!SECRET_KEY || !ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
    console.error("Variáveis de ambiente de autenticação não definidas!");
    throw new Error("Configuração do servidor incompleta.");
  }

  if (username !== ADMIN_USERNAME) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isPasswordValid) {
    return null;
  }

  const token = jwt.sign(
    { id: "admin_user_id", username: ADMIN_USERNAME },
    SECRET_KEY,
    { expiresIn: "8h" }
  );

  return token;
}
