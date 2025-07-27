import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import student_groupRoutes from "./routes/student_groupRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import teacherSubjectGroupRoutes from "./routes/teacherSubjectGroupRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import rfidRoutes from "./routes/rfidRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import graphicRoutes from "./routes/graphicRoutes.js"

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/api/academic/", userRoutes);
app.use("/api/academic/groups/", groupRoutes);
app.use("/api/academic/student-groups/", student_groupRoutes);
app.use("/api/academic/subjects/", subjectRoutes);
app.use("/api/academic/schedules/", scheduleRoutes);
app.use("/api/academic/teacher-subject-groups/", teacherSubjectGroupRoutes);
app.use("/api/academic/classrooms/", classroomRoutes);
app.use("/api/academic/grades/", gradeRoutes);
app.use("/api/academic/rfid/", rfidRoutes);
app.use("/api/academic/attendance/", attendanceRoutes);
app.use("/api/academic/hardware/", sensorRoutes);
app.use("/api/academic/graphics/", graphicRoutes);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
