import express from "express";
import * as rentalController from "../controllers/rental.controller.js";

const router = express.Router();

router.get("/rentals", rentalController.list);
router.post("/rentals", rentalController.create);
router.post("/rentals/:id/return", rentalController.finish);
router.delete("/rentals/:id", rentalController.delet);

export default router;