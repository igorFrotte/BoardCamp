import express from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = express.Router();

router.get("/categories", categoryController.list);
router.post("/categories", categoryController.create);

export default router;