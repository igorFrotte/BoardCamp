import express from "express";
import * as gameController from "../controllers/game.controller.js";

const router = express.Router();

router.get("/games", gameController.list);
router.post("/games", gameController.create);

export default router;