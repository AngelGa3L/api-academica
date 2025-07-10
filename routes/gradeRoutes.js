import express from "express";
import { body } from "express-validator";
import gradesController from "../controllers/gradesController.js";
import rolesMiddleware from "../middlewares/roles.js";
import verifyToken from "../middlewares/auth.js";

const router = express.Router();

const registerGrade = [
  body("student_id")
    .isInt({ min: 1 })
    .withMessage("El ID del estudiante debe ser un número entero positivo"),
  body("subject_id")
    .isInt({ min: 1 })
    .withMessage("El ID de la materia debe ser un número entero positivo"),
  body("unit_number")
    .isInt({ min: 1 })
    .withMessage("El numero de unidad debe ser un número entero positivo"),
  body("grade")
    .isFloat({ min: 0, max: 99.99 })
    .withMessage("La calificación debe ser un número decimal entre 0 y 99.99")
    .custom((value) => {
      if (!/^\d{1,2}(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error("La calificación debe tener máximo 2 decimales");
      }
      return true;
    }),
  body("notes")
    .optional()
    .isString()
    .withMessage("Las notas deben ser texto")
    .isLength({ max: 500 })
    .withMessage("Las notas no pueden exceder 500 caracteres"),
];

const updateGrade = [
  body("student_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del estudiante debe ser un número entero positivo"),
  body("subject_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de la materia debe ser un número entero positivo"),
  body("unit_number")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El numero de unidad debe ser un número entero positivo"),
  body("grade")
    .optional()
    .isFloat({ min: 0, max: 99.99 })
    .optional()
    .withMessage("La calificación debe ser un número decimal entre 0 y 99.99")
    .custom((value) => {
      if (!/^\d{1,2}(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error("La calificación debe tener máximo 2 decimales");
      }
      return true;
    }),
  body("notes")
    .optional()
    .isString()
    .withMessage("Las notas deben ser texto")
    .isLength({ max: 500 })
    .withMessage("Las notas no pueden exceder 500 caracteres"),
];

router.post(
  "/",
  verifyToken,
  rolesMiddleware(["teacher"]),
  registerGrade,
  gradesController.register
);

router.put(
  "/:id",
  verifyToken,
  rolesMiddleware(["teacher"]),
  updateGrade,
  gradesController.update
);

router.get(
  "/student/:student_id",
  verifyToken,
  gradesController.getByStudentId
);

router.get(
  "/student/:student_id/:subject_id",
  verifyToken,
  gradesController.getByStudentAndSubject
);

export default router;
