import { Router } from 'express';
import { check } from 'express-validator';
import { createTransaction, revertTransaction, getTransactions } from './transaction.controller.js';
import { validarJWT } from '../middlewares/validate-jwt.js';

const router = Router();

router.post(
    "/transfer",
    [
        validarJWT,
        check('amount', 'The amount is required').not().isEmpty().isNumeric(),
        check('toAccount', 'The acountNumber is required').not().isEmpty(),
        check('description', 'The description cant be null').not().isEmpty(),
    ], createTransaction)

router.put(
    "/revert/:transactionId",
    [
        validarJWT,
    ], revertTransaction)

router.get(
    "/myTransactions",
    [
        validarJWT,
    ], getTransactions)

export default router;
