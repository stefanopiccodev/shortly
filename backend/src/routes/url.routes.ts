import { Router } from "express";
import { shortenUrl, redirectToOriginal, getUserUrls, deleteShortUrl } from "../controllers/url.controller";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/shorten", authenticate, shortenUrl);
router.get("/user", authenticate, getUserUrls);
router.delete("/:id", authenticate, deleteShortUrl);

export default router;
