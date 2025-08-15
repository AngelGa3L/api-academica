import express from "express";
import { body } from "express-validator";
import restriccionsController from "../controllers/restriccionsController.js";
import checkRoles from "../middlewares/roles.js";
import verifyToken from "../middlewares/auth.js";
import checkIsActive from "../middlewares/is_active.js";

const router = express.Router();

const createRestrictionValidation = [
  body("user_id")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),
  body("classroom_id")
    .notEmpty()
    .withMessage("El ID del aula es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El ID del aula debe ser un número entero positivo"),
];

// Crear una nueva restricción
router.post(
  "/create",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  createRestrictionValidation,
  restriccionsController.create
);

// Obtener todas las restricciones
router.get(
  "/",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  restriccionsController.getAll
);

// Obtener restricciones por usuario
router.get(
  "/user/:user_id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  restriccionsController.getByUserId
);

// Obtener restricciones por aula
router.get(
  "/classroom/:classroom_id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  restriccionsController.getByClassroomId
);

// Eliminar una restricción
router.delete(
  "/:id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  restriccionsController.delete
);

export default router;
