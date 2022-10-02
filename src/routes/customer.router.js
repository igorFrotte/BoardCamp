import express from "express";
import * as costumerController from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/customers", costumerController.list);
router.get("/customers/:id", costumerController.listById);
router.post("/customers", costumerController.create);
router.put("/customers/:id", costumerController.update);

export default router;