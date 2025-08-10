import express from "express";
import { body } from "express-validator";
import sensorsController from "../controllers/sensorsController.js";
import rolesMiddleware from "../middlewares/roles.js";
import verifyToken from "../middlewares/auth.js";
import checkIsActive from "../middlewares/is_active.js";
import checkRoles from "../middlewares/roles.js";

const router = express.Router();

const registerSensor = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("esp32_code").notEmpty().withMessage("El codigo es obligatorio"),
  body("type")
    .notEmpty()
    .withMessage("El tipo debe ser obligatorio")
    .isIn(["access", "attendance", "work_entry", "work_out"])
    .withMessage("El tipo debe ser access, attendance, work_entry o work_out"),
  body("classroom_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

router.post(
  "/",
  verifyToken,
  checkIsActive,
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
    .isIn(["access", "attendance", "work_entry", "work_out"])
    .withMessage("El tipo debe ser access, attendance, work_entry o work_out"),
  body("classroom_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];
router.get(
  "/",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  sensorsController.getAll
);

router.put(
  "/:id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  updateSensor,
  sensorsController.update
);

export default router;
