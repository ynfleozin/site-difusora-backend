import express from "express";
import {
  getLiveStreamLink,
  setLiveStreamLink,
  removeLiveStreamLink,
} from "../../database/firestoreService";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const embedLink = await getLiveStreamLink();
    res.json({ liveLinkEmbed: embedLink });
  } catch {
    res.status(500).json({ message: "Erro ao buscar live stream." });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { liveLink } = req.body;
  if (!liveLink)
    return res.status(400).json({ message: "liveLink é obrigatório." });

  try {
    await setLiveStreamLink(liveLink);
    res.json({ message: "Link da live atualizado com sucesso." });
  } catch {
    res.status(500).json({ message: "Erro ao salvar link da live." });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    await removeLiveStreamLink();
    res.json({ message: "Link da live removido com sucesso." });
  } catch {
    res.status(500).json({ message: "Erro ao remover link da live." });
  }
});

export default router;
