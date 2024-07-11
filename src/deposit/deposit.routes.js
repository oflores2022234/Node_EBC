import { Router } from "express";
import { check } from "express-validator";
import { createDeposit, editDepositAmount, revertDeposit, getDeposits } from "./deposit.controller.js";
import {validarJWT } from '../middlewares/validate-jwt.js'

const router = Router();

router.post(
    '/depositary',
    [
        validarJWT,
        check('amount', 'Amount is required').not().isEmpty(),
        check('toAccount', 'To Account is required').not().isEmpty()
    ],
    createDeposit
);

router.put(
    '/revert/:depositId',
    [
        validarJWT
    ],
    revertDeposit
);

router.post(
    '/editDeposit/:depositId',
    [
        validarJWT
    ],
    editDepositAmount
);

router.get(
    '/depositsAll',
    [
        validarJWT
    ],
    getDeposits
);

export default router;