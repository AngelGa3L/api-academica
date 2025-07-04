import express from "express";
import verifyToken from "../middlewares/auth.js";
import { body, param } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import schedulesController from "../controllers/schedulesController.js";

const router = express.Router();

const createScheduleValidation = [
  body("weekday")
    .notEmpty()
    .withMessage("El día de la semana es requerido")
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    .withMessage(
      "El día de la semana debe ser Monday, Tuesday, Wednesday, Thursday o Friday"
    ),
  body("start_time")
    .notEmpty()
    .withMessage("La hora de inicio es requerida")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("La hora de inicio debe tener el formato HH:mm:ss"),
  body("end_time")
    .notEmpty()
    .withMessage("La hora de fin es requerida")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("La hora de fin debe tener el formato HH:mm:ss"),
];

const updateScheduleValidation = [
  body("weekday")
    .optional()
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    .withMessage(
      "El día de la semana debe ser Monday, Tuesday, Wednesday, Thursday o Friday"
    ),
  body("start_time")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("La hora de inicio debe tener el formato HH:mm:ss"),
  body("end_time")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage("La hora de fin debe tener el formato HH:mm:ss"),
];

const idValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

const weekdayValidation = [
  param("weekday")
    .isIn(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
    .withMessage(
      "El día de la semana debe ser Monday, Tuesday, Wednesday, Thursday o Friday"
    ),
];

router.get("/", verifyToken, schedulesController.getAll);
router.get(
  "/weekday/:weekday",
  verifyToken,
  weekdayValidation,
  schedulesController.getByWeekday
);
router.get("/:id", verifyToken, idValidation, schedulesController.getById);

router.post(
  "/create",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  createScheduleValidation,
  schedulesController.create
);

router.put(
  "/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  idValidation,
  updateScheduleValidation,
  schedulesController.update
);

export default router;
