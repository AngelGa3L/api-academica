import express from "express";
import { body } from "express-validator";
import sensorsController from "../controllers/sensorsController.js";
import rolesMiddleware from "../middlewares/roles.js";
import verifyToken from "../middlewares/auth.js";
import checkRoles from "../middlewares/roles.js";

const router = express.Router();

const registerSensor = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("esp32_code").notEmpty().withMessage("El codigo es obligatorio"),
  body("type")
    .notEmpty()
    .withMessage("El tipo debe ser obligatorio")
    .isIn(["access", "attendance", "other"])
    .withMessage("El tipo debe ser access, attendance u other"),
  body("classroom_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

router.post(
  "/",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  registerSensor,
  sensorsController.create
);

const updateSensor = [
  body("name").optional().notEmpty().withMessage("El nombre es obligatorio"),
  body("esp32_code")
    .optional()
    .notEmpty()
    .withMessage("El código es obligatorio"),
  body("type")
    .optional()
    .isIn(["access", "attendance", "other"])
    .withMessage("El tipo debe ser access, attendance u other"),
  body("classroom_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];
router.get(
  "/",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  sensorsController.getAll
);

router.put(
  "/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  updateSensor,
  sensorsController.update
);

export default router;
