import e, { Router } from "express";
import { check } from "express-validator";
import { addFavorite, obtenerCuentasAsc, obtenerDetallesCuenta, listFavorites, changePassword, getAccountDetailsUser, getAccountDetails, addService, myServices, getQuery } from "./account.controller.js";
import { validarJWT } from "../middlewares/validate-jwt.js";

const router = Router();

router.get('/accountDetails', validarJWT, getAccountDetails);

router.post(
    "/addFavorite",
    [
        validarJWT,
        check("accountNumber", "The accountNumber is required").not().isEmpty(),
        check("alias", "The alias is required").not().isEmpty(),
    ],
    addFavorite
);

router.get("/listFavorites", validarJWT, listFavorites);

router.get('/accounts-by-movements/:order', [
    check('order', 'The order is required').not().isEmpty(),
],obtenerCuentasAsc);

router.get('/myAccountD', validarJWT, getAccountDetails);

router.get('/detailsAccount/:accountId',obtenerDetallesCuenta);

router.get('/accountDetailsUser', validarJWT, getAccountDetailsUser);

router.patch('/changePassword',
    [
        validarJWT,
        check('password', 'The password is required').not().isEmpty(),
        check('newPassword', 'The new password is required').not().isEmpty(),
        check('password', 'Password min 6 max 12').isLength({ min: 8}),
        check('newPassword', 'New password min 6 max 12').isLength({ min: 8}),
    ],
    changePassword
);

router.put('/addService/:idService',
    [
        validarJWT,
        check('serviceId', 'The serviceId is required').not().isEmpty(),
    ],
    addService
);

router.get('/myServices', validarJWT, myServices);

router.get('/query', validarJWT, getQuery);

export default router;