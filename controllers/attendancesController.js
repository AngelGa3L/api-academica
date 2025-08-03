import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";
import { DateTime } from "luxon";
const prisma = new PrismaClient();

const attendancesController = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        data: {},
        msg: errors.array().map((e) => e.msg),
      });
    }
    try {
      const {
        user_id,
        subject_id,
        date,
        check_in_time,
        status,
        sensor_id,
        notes,
      } = req.body;
      const now = new Date(DateTime.now().setZone("America/Monterrey").toISO());
      now.setHours(now.getHours() - 6);
      const user = await prisma.users.findUnique({
        where: { id: Number(user_id) },
      });
      if (!user) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["El alumno no existe"],
        });
      }
      const subject = await prisma.subjects.findUnique({
        where: { id: Number(subject_id) },
      });
      if (!subject) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["La materia no existe"],
        });
      }
      const attendance = await prisma.attendance.create({
        data: {
          user_id,
          subject_id,
          date: now,
          check_in_time: now,
          status,
          sensor_id,
          notes,
        },
      });
      return res.status(201).json({
        status: "success",
        data: attendance,
        msg: ["Asistencia registrada manualmente"],
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", data: {}, msg: [error.message] });
    }
  },
  update: async (req, res) => {
    const { id } = req.params;
    const { check_in_time, status, notes } = req.body;
    try {
      const attendance = await prisma.attendance.update({
        where: { id: Number(id) },
        data: { check_in_time, status, notes },
      });
      return res.status(200).json({
        status: "success",
        data: attendance,
        msg: ["Asistencia actualizada"],
      });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", data: {}, msg: [error.message] });
    }
  },
  getByFilters: async (req, res) => {
    const { user_id, month, year, subject_id } = req.query;
    try {
      const where = {};
      if (user_id) where.user_id = Number(user_id);
      if (subject_id) where.subject_id = Number(subject_id);

      // Solo filtra por mes y año si ambos están presentes y son válidos
      if (
        month &&
        year &&
        !isNaN(Number(month)) &&
        !isNaN(Number(year)) &&
        Number(month) >= 1 &&
        Number(month) <= 12
      ) {
        const start = new Date(
          `${year}-${month.toString().padStart(2, "0")}-01T00:00:00.000Z`
        );
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        where.date = {
          gte: start,
          lt: end,
        };
      }

      const attendances = await prisma.attendance.findMany({ where });
      return res.status(200).json({
        status: "success",
        data: attendances,
        msg: ["Asistencias filtradas"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  getByGroup: async (req, res) => {
  try {
    const { group_id } = req.params;
    const { startDate, endDate, subject_id } = req.query;

    if (!group_id) {
      return res.status(400).json({
        status: "error",
        data: {},
        msg: ["El parámetro group_id es obligatorio"],
      });
    }

    const students = await prisma.student_group.findMany({
      where: {
        group_id: parseInt(group_id),
        users: { is_active: true },
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

    if (students.length === 0) {
      return res.status(404).json({
        status: "error",
        data: {},
        msg: ["No se encontraron estudiantes en este grupo"],
      });
    }

    const where = {
      user_id: { in: students.map(s => s.student_id) },
    };

    if (subject_id) where.subject_id = parseInt(subject_id);

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        subjects: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      data: attendances,
      msg: ["Asistencias del grupo obtenidas correctamente"],
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      data: {},
      msg: [error.message],
    });
  }
},
};

export default attendancesController;
