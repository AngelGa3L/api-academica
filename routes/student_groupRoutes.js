import express from "express";
import { body } from "express-validator";
import student_groupController from "../controllers/students_groupsController.js";
import authMiddleware from "../middlewares/auth.js";
import rolesMiddleware from "../middlewares/roles.js";
import verifyToken from "../middlewares/auth.js";

const router = express.Router();

const createStudentGroupValidation = [
  body("student_id")
    .isInt({ min: 1 })
    .withMessage("El ID del estudiante debe ser un número entero positivo"),
  body("group_id")
    .isInt({ min: 1 })
    .withMessage("El ID del grupo debe ser un número entero positivo"),
  body("academic_year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año académico debe ser un año válido entre 2000 y 2100"),
];

const updateStudentGroupValidation = [
  body("group_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del grupo debe ser un número entero positivo"),
  body("academic_year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("El año académico debe ser un año válido entre 2000 y 2100"),
];

router.use(authMiddleware);

router.post(
  "/assign",
  verifyToken,
  rolesMiddleware(["admin", "secretary"]),
  createStudentGroupValidation,
  student_groupController.create
);

//Ver los grupos y estudiantes 
router.get("/", verifyToken, student_groupController.getAll);

//Obtener estudiantes de un grupo específico
router.get(
  "/:group_id/students",
  verifyToken,
  student_groupController.getStudentsByGroup
);
// Actualizar asignación
router.put(
  "/student/update",
  verifyToken,
  rolesMiddleware(["admin", "secretary"]),
  [
    body("student_id")
      .isInt({ min: 1 })
      .withMessage("El ID del estudiante debe ser un número entero positivo"),
    body("group_id")
      .isInt({ min: 1 })
      .withMessage("El ID del grupo debe ser un número entero positivo"),
    body("academic_year")
      .isInt({ min: 2000, max: 2100 })
      .withMessage("El año académico debe ser un año válido entre 2000 y 2100"),
  ],
  student_groupController.update
);

export default router;
