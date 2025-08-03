import express from "express";
import { body } from "express-validator";
import attendancesController from "../controllers/attendancesController.js";
import verifyToken from "../middlewares/auth.js";
import checkRoles from "../middlewares/roles.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  checkRoles(["teacher"]),
  [
    body("user_id").isInt(),
    body("subject_id").isInt(),
    body("date").optional().isISO8601(),
    body("check_in_time").optional().isISO8601(),
    body("status").optional().isIn(["present", "late", "absent"]),
    body("sensor_id").optional().isInt(),
    body("notes").optional().isString(),
  ],
  attendancesController.create
);

router.put(
  "/:id",
  verifyToken,
  checkRoles(["teacher"]),
  [
    body("check_in_time").optional().isISO8601(),
    body("status").optional().isIn(["present", "late", "absent"]),
    body("notes").optional().isString(),
  ],
  attendancesController.update
);
router.get(
  "/",
  verifyToken,
  checkRoles(["student", "teacher"]),
  attendancesController.getByFilters
);
router.get(
  "/group/:group_id",
  verifyToken,
  checkRoles(["admin", "secretary", "teacher"]),
  attendancesController.getByGroup
);

export default router;
