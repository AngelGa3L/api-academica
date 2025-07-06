import express from "express";
import verifyToken from "../middlewares/auth.js";
import { body } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import classroomController from "../controllers/classroomsController.js";

const router = express.Router();

const registerClassroomValidation = [
  body("name").notEmpty().withMessage("El nombre del aula es obligatorio"),
];

const updateClassroomValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre del aula es obligatorio"),
  body("is_blocked")
    .optional()
    .isBoolean()
    .withMessage("El estado de bloqueo es inválido"),
];

router.post(
  "/create",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  registerClassroomValidation,
  classroomController.register
);

router.put(
  "/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  updateClassroomValidation,
  classroomController.update
);

router.get(
  "/",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  classroomController.getAll
);

router.get("/:id", verifyToken, classroomController.getByid);

export default router;
