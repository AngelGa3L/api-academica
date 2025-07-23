import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

const graphicsController = {
  // Alumnos con más ausencias por grupo
  absencesByGroup: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }

      const groups = await prisma.groups.findMany({
        select: { id: true, name: true },
      });

      const result = [];

      for (const group of groups) {
        const students = await prisma.student_group.findMany({
          where: {
            group_id: group.id,
            users: {
              is: {
                is_active: true,
              },
            },
          },
          select: {
            student_id: true,
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        });
        const studentsWithAbsences = await Promise.all(
          students.map(async (student) => {
            const absences = await prisma.attendance.count({
              where: {
                user_id: student.student_id,
                status: "absent",
                ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
              },
            });
            return {
              student_id: student.student_id,
              name: `${student.users.first_name} ${student.users.last_name}`,
              email: student.users.email,
              absences,
            };
          })
        );
        studentsWithAbsences.sort((a, b) => b.absences - a.absences);
        const top = studentsWithAbsences[0];

        result.push({
          group_id: group.id,
          group_name: group.name,
          top_student: top || null,
        });
      }

      res.status(200).json({
        status: "success",
        data: result,
        msg: "Alumnos con más ausencias por grupo",
      });
    } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
    }
  },
  getAttendanceByGroup: async (req, res) => {
    try {
      const { group_id } = req.params;
      const { startDate, endDate } = req.query;

      if (!group_id) {
        return res.status(400).json({
          status: "error",
          msg: "El parámetro groupId es obligatorio",
        });
      }

      const students = await prisma.student_group.findMany({
        where: {
          group_id: parseInt(group_id),
          users: { is: { is_active: true } },
        },
        select: {
          student_id: true,
          users: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      const attendance = await prisma.attendance.findMany({
        where: {
          user_id: { in: students.map((s) => s.student_id) },
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        orderBy: { date: "desc" },
        select: {
          user_id: true,
          date: true,
          status: true,
        },
      });

      const result = attendance.map((a) => {
        const student = students.find((s) => s.student_id === a.user_id);
        return {
          first_name: student?.users.first_name,
          last_name: student?.users.last_name,
          date: a.date,
          status: a.status,
        };
      });

      res.status(200).json({
        status: "success",
        data: result,
        msg: "Asistencias del grupo obtenidas correctamente",
      });
    } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
    }
  },
  getWorkShifts: async (req, res) => {
    try {
      const { user_id, startDate, endDate } = req.query;

      const where = {};
      if (user_id) where.user_id = parseInt(user_id);
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      const allowedRoles = ["teacher", "secretary"];
      const users = await prisma.users.findMany({
        where: {
          role_id: {
            in: await prisma.roles
              .findMany({
                where: { name: { in: allowedRoles } },
                select: { id: true },
              })
              .then((roles) => roles.map((r) => r.id)),
          },
        },
        select: { id: true, first_name: true, last_name: true, roles: true },
      });

      const shifts = await prisma.work_shifts.findMany({
        where: {
          ...where,
          user_id: { in: users.map((u) => u.id) },
        },
        orderBy: { date: "desc" },
        select: {
          user_id: true,
          date: true,
          check_in_time: true,
          check_out_time: true,
          users: {
            select: {
              first_name: true,
              last_name: true,
              roles: { select: { name: true } },
            },
          },
        },
      });

      res.status(200).json({
        status: "success",
        data: shifts,
        msg: "Entradas y salidas encontradas",
      });
    } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
    }
  },
  lowestSubject: async (req, res) => {
    try {
      const groups = await prisma.groups.findMany({
        select: { id: true, name: true },
      });

      const result = [];

      for (const group of groups) {
        const students = await prisma.student_group.findMany({
          where: { group_id: group.id },
          select: { student_id: true },
        });
        const studentIds = students.map((s) => s.student_id);

        const subjectLinks = await prisma.teacher_subject_group.findMany({
          where: { group_id: group.id },
          select: { subject_id: true, subjects: { select: { name: true } } },
        });

        let lowest = null;
        for (const subject of subjectLinks) {
          const grades = await prisma.grades.findMany({
            where: {
              subject_id: subject.subject_id,
              student_id: { in: studentIds },
            },
            select: { grade: true },
          });
          if (grades.length === 0) continue;
          const avg =
            grades.reduce((sum, g) => sum + Number(g.grade), 0) / grades.length;

          if (!lowest || avg < lowest.average) {
            lowest = {
              subject_id: subject.subject_id,
              subject_name: subject.subjects.name,
              average: avg,
            };
          }
        }

        result.push({
          group_id: group.id,
          group_name: group.name,
          lowest_subject: lowest,
        });
      }

      res.status(200).json({
        status: "success",
        data: result,
        msg: "Materia con menor promedio por grupo",
      });
    } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
    }
  },
};

export default graphicsController;
