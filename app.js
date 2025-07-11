import express from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import student_groupRoutes from './routes/student_groupRoutes.js'
import subjectRoutes from './routes/subjectRoutes.js'
import scheduleRoutes from './routes/scheduleRoutes.js'
import teacherSubjectGroupRoutes from './routes/teacherSubjectGroupRoutes.js'
import classroomRoutes from './routes/classroomRoutes.js'
import gradeRoutes from "./routes/gradeRoutes.js"
import rfidRoutes from "./routes/rfidRoutes.js"


const app = express()
const port = 3000

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/student-groups', student_groupRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/teacher-subject-groups', teacherSubjectGroupRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/grades', gradeRoutes)
app.use('/api/rfid', rfidRoutes)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})