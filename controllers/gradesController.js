import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const gradesController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { student_id, subject_id, unit_number, grade, notes } = req.body;
      const student = await prisma.users.findUnique({
        where: { id: student_id },
        include: { roles: true },
      });

      if (!student) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Estudiante no encontrado"],
        });
      }
      if (student.roles.name.toLowerCase() !== "student") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["El usuario debe ser un estudiante"],
        });
      }
      const subject = await prisma.subjects.findUnique({
        where: { id: subject_id },
      });
      if (!subject) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Materia no encontrada"],
        });
      }
      const existingAssignment = await prisma.grades.findFirst({
        where: { student_id, subject_id, unit_number },
      });
      if (existingAssignment) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: [
            "Ya existe una calificación para este estudiante en esta unidad",
          ],
        });
      }
      const newGrade = await prisma.grades.create({
        data: {
          student_id,
          subject_id,
          unit_number,
          grade,
          ...(notes && { notes }),
        },
      });
      return res.status(201).json({
        status: "success",
        data: newGrade,
        msg: ["Calificación registrada exitosamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { id } = req.params;
      const { student_id, subject_id, unit_number, grade, notes } = req.body;
      const existingGrade = await prisma.grades.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingGrade) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Calificación no encontrada"],
        });
      }
      if (student_id) {
        const student = await prisma.users.findUnique({
          where: { id: student_id },
          include: { roles: true },
        });

        if (!student) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: ["Estudiante no encontrado"],
          });
        }

        if (student.roles.name.toLowerCase() !== "student") {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: ["El usuario debe ser un estudiante"],
          });
        }
      }
      if (subject_id) {
        const subject = await prisma.subjects.findUnique({
          where: { id: subject_id },
        });

        if (!subject) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: ["Materia no encontrada"],
          });
        }
      }

      const conflictingGrade = await prisma.grades.findFirst({
        where: {
          student_id: student_id || existingGrade.student_id,
          subject_id: subject_id || existingGrade.subject_id,
          unit_number: unit_number || existingGrade.unit_number,
          id: { not: parseInt(id) },
        },
      });

      if (conflictingGrade) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: [
            "Ya existe una calificación para este estudiante en esta unidad",
          ],
        });
      }
      const updatedGrade = await prisma.grades.update({
        where: { id: parseInt(id) },
        data: {
          ...(student_id && { student_id }),
          ...(subject_id && { subject_id }),
          ...(unit_number !== undefined && { unit_number }),
          ...(grade !== undefined && { grade }),
          ...(notes !== undefined && { notes }),
        },
      });

      return res.status(200).json({
        status: "success",
        data: updatedGrade,
        msg: ["Calificación actualizada exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Calificación no encontrada"],
        });
      }

      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  getByStudentId: async (req, res) => {
    try {
      const { student_id } = req.params;

      const student = await prisma.users.findUnique({
        where: { id: parseInt(student_id) },
        include: { roles: true },
      });

      if (!student) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Estudiante no encontrado"],
        });
      }

      if (student.roles.name.toLowerCase() !== "student") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["El usuario debe ser un estudiante"],
        });
      }

      const grades = await prisma.grades.findMany({
        where: { student_id: parseInt(student_id) },
        include: {
          subjects: {
            select: {
              id: true,
              name: true,
              code: true,
              teacher_subject_group: {
                include: {
                  users: {
                    select: {
                      id: true,
                      first_name: true,
                      last_name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { id: "desc" },
      });

      return res.status(200).json({
        status: "success",
        data: {
          student: {
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
          },
          grades: grades.map((grade) => ({
            id: grade.id,
            subject: {
              id: grade.subjects.id,
              name: grade.subjects.name,
              code: grade.subjects.code,
            },
            teacher:
              grade.subjects.teacher_subject_group.length > 0
                ? {
                    id: grade.subjects.teacher_subject_group[0].users.id,
                    first_name:
                      grade.subjects.teacher_subject_group[0].users.first_name,
                    last_name:
                      grade.subjects.teacher_subject_group[0].users.last_name,
                    email: grade.subjects.teacher_subject_group[0].users.email,
                  }
                : null,
            unit_number: grade.unit_number,
            grade: parseFloat(grade.grade),
            notes: grade.notes,
          })),
        },
        msg: ["Calificaciones obtenidas exitosamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  getByStudentAndSubject: async (req, res) => {
    try {
      const { student_id, subject_id } = req.params;

      const student = await prisma.users.findUnique({
        where: { id: parseInt(student_id) },
        include: { roles: true },
      });

      if (!student) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Estudiante no encontrado"],
        });
      }
      if (student.roles.name.toLowerCase() !== "student") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["El usuario debe ser un estudiante"],
        });
      }

      const subject = await prisma.subjects.findUnique({
        where: { id: parseInt(subject_id) },
        include: {
          teacher_subject_group: {
            include: {
              users: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!subject) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Materia no encontrada"],
        });
      }

      const grades = await prisma.grades.findMany({
        where: {
          student_id: parseInt(student_id),
          subject_id: parseInt(subject_id),
        },
        orderBy: { unit_number: "asc" },
      });

      return res.status(200).json({
        status: "success",
        data: {
          student: {
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
          },
          subject: {
            id: subject.id,
            name: subject.name,
            code: subject.code,
          },
          teacher:
            subject.teacher_subject_group.length > 0
              ? {
                  id: subject.teacher_subject_group[0].users.id,
                  first_name: subject.teacher_subject_group[0].users.first_name,
                  last_name: subject.teacher_subject_group[0].users.last_name,
                  email: subject.teacher_subject_group[0].users.email,
                }
              : null,
          grades: grades.map((grade) => ({
            id: grade.id,
            unit_number: grade.unit_number,
            grade: parseFloat(grade.grade),
            notes: grade.notes,
          })),
          total_grades: grades.length,
        },
        msg: [
          "Calificaciones del estudiante en la materia obtenidas exitosamente",
        ],
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

export default gradesController;
