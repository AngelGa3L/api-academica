import express from "express";
import verifyToken from "../middlewares/auth.js";
import { body, validationResult } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import rfidsController from "../controllers/rfidsController.js";

const router = express.Router();

const rfidValidationRules = [
  body("uid")
    .matches(/^[A-F0-9]{8,20}$/)
    .withMessage(
      "El UID debe tener entre 8 y 20 caracteres hexadecimales en mayúsculas"
    ),
  body("user_id").isInt().withMessage("El user_id debe ser un número entero"),
];

const updateRfid = [
  body("uid")
    .optional()
    .matches(/^[A-F0-9]{8,20}$/)
    .withMessage(
      "El UID debe tener entre 8 y 20 caracteres hexadecimales en mayúsculas"
    ),
  body("user_id")
    .optional()
    .isInt()
    .withMessage("El user_id debe ser un número entero"),
];
router.post(
  "/create",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  rfidValidationRules,
  rfidsController.create
);

router.put(
  "/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  updateRfid,
  rfidsController.update
);

router.get(
  "/",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  rfidsController.getAll
);

router.get(
  "/users/:user_id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  rfidsController.getByUser
);

router.delete(
  "/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  rfidsController.delete
);
export default router;
