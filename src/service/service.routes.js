import { Router } from 'express';
import { check } from 'express-validator';
import { 
    addService,
    getServices,
    getService,
    updateService,
    deleteService
} from '../service/service.controller.js';
import { validateFields } from '../middlewares/validate-fields.js';
import { validarJWT } from '../middlewares/validate-jwt.js';
const router = Router();

router.post(
    "/addService",
    [
        validarJWT,
        check('imagen', 'The imagen is required').not().isEmpty().isURL(),
        check('nameService', 'The nameService is required').not().isEmpty(),
        check('description', 'The description is required').not().isEmpty(),
        check('price', 'The price is required').not().isEmpty(),
        validateFields
    ], addService)

router.get("/getServices", getServices);

router.get("/getService/:id", getService);

router.put("/updateService/:id", [
    validarJWT,
    check('imagen', 'The imagen is required').not().isEmpty().isURL(),
    check('nameService', 'The nameService is required').not().isEmpty(),
    check('description', 'The description is required').not().isEmpty(),
    check('price', 'The price is required').not().isEmpty(),
    validateFields
], updateService);

router.delete("/deleteService/:id", validarJWT, deleteService);
    
export default router;
