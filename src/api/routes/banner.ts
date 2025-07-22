import { Router } from "express";
import {
  getAllBanners,
  updateBannerImage,
} from "../../database/firestoreService";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const banners = await getAllBanners();
    res.json(banners);
  } catch (error) {
    console.error("Erro ao buscar banners:", error);
    res.status(500).json({ message: "Erro ao buscar banners" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: "URL da imagem é obrigatória." });
  }

  try {
    const success = await updateBannerImage(id, imageUrl);
    if (success) {
      res.json({ message: `Banner ${id} atualizado com sucesso!` });
    } else {
      res.status(404).json({ message: `Banner com ID ${id} não encontrado.` });
    }
  } catch (error) {
    console.error(`Erro ao atualizar o banner ${id}:`, error);
    res.status(500).json({ message: "Erro ao atualizar banner." });
  }
});

export default router;
