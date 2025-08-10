import express from "express";
import verifyToken from "../middlewares/auth.js";
import checkIsActive from "../middlewares/is_active.js";
import { body, validationResult } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import graphicsController from "../controllers/graphicsController.js";

const router = express.Router();

router.get(
  "/top-absences",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary", "teacher"]),
  graphicsController.absencesByGroup
);

router.get(
  "/attendance-by-group/:group_id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary", "teacher"]),
  graphicsController.getAttendanceByGroup
);
router.get(
  "/work-shifts",
  verifyToken,
  checkIsActive,
  checkRoles(["admin"]),
  graphicsController.getWorkShifts
);
router.get(
  "/subject-average",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary", "teacher"]),
  graphicsController.lowestSubject
);
router.get(
  "/access-logs/:classroom_id",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  graphicsController.logsByClassroom
);
router.get(
  "/sensor-responses",
  verifyToken,
  checkIsActive,
  checkRoles(["admin", "secretary"]),
  graphicsController.getSensorResponses
);
export default router;
