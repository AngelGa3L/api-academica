import express from "express";
import verifyToken from "../middlewares/auth.js";
import { body, validationResult } from "express-validator";
import checkRoles from "../middlewares/roles.js";
import graphicsController from "../controllers/graphicsController.js";

const router = express.Router();

router.get(
  "/top-absences",
  verifyToken,
  checkRoles(["admin", "secretary", "teacher"]),
  graphicsController.absencesByGroup
);

router.get(
  "/attendance-by-group/:group_id",
  verifyToken,
  checkRoles(["admin", "secretary", "teacher"]),
  graphicsController.getAttendanceByGroup
);
router.get(
  "/work-shifts",
  verifyToken,
  checkRoles(["admin"]),
  graphicsController.getWorkShifts
);
router.get(
  "/subject-average",
  verifyToken,
  checkRoles(["admin", "secretary", "teacher"]),
  graphicsController.lowestSubject
);
router.get(
  "/access-logs/:classroom_id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  graphicsController.logsByClassroom
);
export default router;
