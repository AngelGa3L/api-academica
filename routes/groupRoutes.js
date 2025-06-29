import express from "express";
import { body } from "express-validator";
import groupsController from "../controllers/groupsController.js";
import authMiddleware from "../middlewares/auth.js";
import rolesMiddleware from "../middlewares/roles.js";
import verifyToken from "../middlewares/auth.js";

const router = express.Router();

const createGroupValidation = [
  body("name")
    .notEmpty()
    .withMessage("El nombre del grupo es requerido")
    .isLength({ min: 1, max: 20 })
    .withMessage("El nombre debe tener entre 1 y 20 caracteres")
    .trim(),
  body("grade")
    .optional()
    .isIn(["Elementary_School", "Middle_School", "High_School"])
    .withMessage(
      "El grado debe ser Elementary_School, Middle_School o High_School"
    ),
];

const updateGroupValidation = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage("El nombre debe tener entre 1 y 20 caracteres")
    .trim(),
  body("grade")
    .optional()
    .isIn(["Elementary_School", "Middle_School", "High_School"])
    .withMessage(
      "El grado debe ser Elementary_School, Middle_School o High_School"
    ),
];

router.use(authMiddleware);

router.post(
  "/create",
  verifyToken,
  rolesMiddleware(["admin", "secretary"]),
  createGroupValidation,
  groupsController.create
);

router.get("/list", verifyToken, groupsController.getAll);

router.get("/:id", verifyToken, groupsController.getById);

router.put(
  "/:id",
  verifyToken,
  rolesMiddleware(["admin", "secretary"]),
  updateGroupValidation,
  groupsController.update
);

router.delete(
  "/:id",
  verifyToken,
  rolesMiddleware(["admin"]),
  groupsController.delete
);

export default router;
