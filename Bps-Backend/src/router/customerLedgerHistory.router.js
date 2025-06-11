import express from "express";
import {
    previewInvoices,
    generateInvoices,
    getAllInvoices,
} from "../controller/customerLedgerHistory.controller.js"

const router = express.Router();

router.post("/preview", previewInvoices);
router.post("/generate", generateInvoices);
router.get("/all", getAllInvoices);

export default router;