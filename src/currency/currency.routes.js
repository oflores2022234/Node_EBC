import { Router } from "express";
import { convertData } from "./currency.controller.js";
import { validarJWT } from "../middlewares/validate-jwt.js";

const router = Router();

router.post("/convert",
    validarJWT,
    convertData);

export default router;