import express from "express";
import verifyToken from "../middlewares/auth.js";
import checkIsActive from "../middlewares/is_active.js";
import { body, param } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import teacherSubjectGroupController from "../controllers/teacherSubjectGroupController.js";

const router = express.Router();

const createAssignmentValidation = [
  body("teacher_id")
    .notEmpty()
    .withMessage("El ID del profesor es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del profesor debe ser un número entero positivo"),
  body("subject_id")
    .notEmpty()
    .withMessage("El ID de la materia es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID de la materia debe ser un número entero positivo"),
  body("group_id")
    .notEmpty()
    .withMessage("El ID del grupo es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del grupo debe ser un número entero positivo"),
  body("classroom_id")
    .notEmpty()
    .withMessage("El ID del aula es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del aula debe ser un número entero positivo"),
  body("schedule_id")
    .notEmpty()
    .withMessage("El ID del horario es requerido")
    .isInt({ min: 1 })
    .withMessage("El ID del horario debe ser un número entero positivo"),
];

const updateAssignmentValidation = [
  body("teacher_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del profesor debe ser un número entero positivo"),
  body("subject_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de la materia debe ser un número entero positivo"),
  body("group_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del grupo debe ser un número entero positivo"),
  body("classroom_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del aula debe ser un número entero positivo"),
  body("schedule_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del horario debe ser un número entero positivo"),
];

const idValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

const teacherIdValidation = [
  param("teacher_id")
    .isInt({ min: 1 })
    .withMessage("El ID del profesor debe ser un número entero positivo"),
];

const groupIdValidation = [
  param("group_id")
    .isInt({ min: 1 })
    .withMessage("El ID del grupo debe ser un número entero positivo"),
];

const studentIdValidation = [
  param("student_id")
    .isInt({ min: 1 })
    .withMessage("El ID delstudent debe ser un número entero positivo"),
];

router.get("/", verifyToken, checkIsActive, teacherSubjectGroupController.getAll);
router.get(
  "/teacher/:teacher_id",
  verifyToken,
  checkIsActive,
  teacherIdValidation,
  teacherSubjectGroupController.getByTeacher
);
router.get(
  "/group/:group_id",
  verifyToken,
  checkIsActive,
  groupIdValidation,
  teacherSubjectGroupController.getByGroup
);
router.get(
  "/:id",
  verifyToken,
  checkIsActive,
  idValidation,
  teacherSubjectGroupController.getById
);
router.get(
  "/student/:student_id",
  verifyToken,
  checkIsActive,
  checkRoles(["student"]),
  studentIdValidation,
  teacherSubjectGroupController.getByStudent
);

router.post(
  "/create",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  createAssignmentValidation,
  teacherSubjectGroupController.create
);

router.put(
  "/:id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  idValidation,
  updateAssignmentValidation,
  teacherSubjectGroupController.update
);

router.delete(
  "/:id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin"]),
  idValidation,
  teacherSubjectGroupController.delete
);

export default router;
