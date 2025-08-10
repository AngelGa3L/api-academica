import express from "express";
import verifyToken from "../middlewares/auth.js";
import checkIsActive from "../middlewares/is_active.js";
import { body } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import subjectsController from "../controllers/subjectsController.js";

const router = express.Router();

// Validaciones para crear materia
const createSubjectValidation = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("code")
    .notEmpty()
    .withMessage("El código es obligatorio")
    .isLength({ min: 2, max: 10 })
    .withMessage("El código debe tener entre 2 y 10 caracteres")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("El código solo puede contener letras mayúsculas, números y un guion"),
];

// Validaciones para actualizar materia
const updateSubjectValidation = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("code")
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage("El código debe tener entre 2 y 10 caracteres")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("El código solo puede contener letras mayúsculas, números y un guion"),
];

// Crear materia
router.post(
  "/register",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  createSubjectValidation,
  subjectsController.register
);

// Obtener todas las materias
router.get("/", verifyToken, checkIsActive, subjectsController.getAll);

// Obtener materia por ID
router.get("/:id", verifyToken, checkIsActive, subjectsController.getById);

// Actualizar materia
router.put(
  "/:id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  updateSubjectValidation,
  subjectsController.update
);

export default router;
