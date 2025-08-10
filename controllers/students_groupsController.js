import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const student_groupController = {
  //Asignar estudiante a grupo
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }

    try {
      const { student_id, group_id, academic_year } = req.body;
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
      const group = await prisma.groups.findUnique({
        where: { id: group_id },
      });

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Grupo no encontrado"],
        });
      }

      // Verificar si el estudiante ya está asignado a otro grupo en el mismo año académico
      const existingAssignment = await prisma.student_group.findFirst({
        where: {
          student_id,
          academic_year,
        },
      });

      if (existingAssignment) {
        // Verificar si ya está asignado al mismo grupo
        if (existingAssignment.group_id === group_id) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: [
              "El estudiante ya está asignado a este grupo en este año académico",
            ],
          });
        }

        // Si ya está asignado a un grupo diferente, actualizar la asignación
        const updatedAssignment = await prisma.student_group.update({
          where: { id: existingAssignment.id },
          data: {
            group_id,
          },
        });

        res.status(200).json({
          status: "success",
          msg: "Estudiante movido al nuevo grupo exitosamente",
          data: updatedAssignment,
        });
      } else {
        // Si no está asignado a ningún grupo, crear nueva asignación
        const studentGroup = await prisma.student_group.create({
          data: {
            student_id,
            group_id,
            academic_year,
          },
        });

        res.status(201).json({
          status: "success",
          msg: "Estudiante asignado al grupo exitosamente",
          data: studentGroup,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  //Actualizar asignación
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }

    try {
      const { student_id, group_id, academic_year } = req.body;
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
      const group = await prisma.groups.findUnique({
        where: { id: group_id },
      });

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Grupo no encontrado"],
        });
      }
      const currentAssignment = await prisma.student_group.findFirst({
        where: {
          student_id: student_id,
          academic_year: academic_year,
        },
      });

      if (!currentAssignment) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: [
            "No se encontró una asignación activa para este estudiante en el año académico especificado",
          ],
        });
      }
      const existingAssignment = await prisma.student_group.findFirst({
        where: {
          student_id: student_id,
          group_id: group_id,
          academic_year: academic_year,
          id: { not: currentAssignment.id },
        },
      });

      if (existingAssignment) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: [
            "El estudiante ya está asignado a este grupo en este año académico",
          ],
        });
      }
      const updatedStudentGroup = await prisma.student_group.update({
        where: { id: currentAssignment.id },
        data: {
          group_id: group_id,
          academic_year: academic_year,
        },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          groups: {
            select: {
              id: true,
              name: true,
              grade: true,
            },
          },
        },
      });

      res.status(200).json({
        status: "success",
        data: updatedStudentGroup,
        msg: [
          `Estudiante ${student.first_name} ${student.last_name} movido al grupo ${group.name} correctamente`,
        ],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  //Obtener todas los grupos
  getAll: async (req, res) => {
    try {
      const { group_id, academic_year, student_id } = req.query;

      const where = {};
      if (group_id) where.group_id = parseInt(group_id);
      if (academic_year) where.academic_year = parseInt(academic_year);
      if (student_id) where.student_id = parseInt(student_id);

      const studentGroups = await prisma.student_group.findMany({
        where,
        select: {
          id: true,
          student_id: true,
          group_id: true,
          academic_year: true,
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              role_id: true,
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
          groups: {
            select: {
              id: true,
              name: true,
              grade: true,
            },
          },
        },
        orderBy: [
          { academic_year: "desc" },
          { groups: { name: "asc" } },
          { users: { last_name: "asc" } },
        ],
      });

      // Filtrar solo usuarios con rol de estudiante
      const filteredStudentGroups = studentGroups.filter(
        (assignment) => assignment.users.roles.name.toLowerCase() === "student"
      );

      res.status(200).json({
        status: "success",
        data: filteredStudentGroups,
        msg: ["Lista de asignaciones obtenida correctamente"],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  //Obtener estudiantes de un grupo específico
  getStudentsByGroup: async (req, res) => {
    try {
      const { group_id } = req.params;
      const { academic_year } = req.query;
      if (!group_id || isNaN(parseInt(group_id))) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["ID del grupo inválido o no proporcionado"],
        });
      }
      const group = await prisma.groups.findUnique({
        where: { id: parseInt(group_id) },
      });

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Grupo no encontrado"],
        });
      }

      const where = { group_id: parseInt(group_id) };
      if (academic_year) where.academic_year = parseInt(academic_year);

      const studentAssignments = await prisma.student_group.findMany({
        where,
        select: {
          academic_year: true,
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              role_id: true,
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          users: { last_name: "asc" },
        },
      });

      // Filtrar solo usuarios con rol de estudiante
      const students = studentAssignments
        .filter(
          (assignment) =>
            assignment.users.roles.name.toLowerCase() === "student"
        )
        .map((assignment) => ({
          student_id: assignment.users.id,
          first_name: assignment.users.first_name,
          last_name: assignment.users.last_name,
          email: assignment.users.email,
          academic_year: assignment.academic_year,
        }));

      res.status(200).json({
        status: "success",
        data: {
          group: {
            id: group.id,
            name: group.name,
            grade: group.grade,
          },
          students: students,
        },
        msg: [`Lista de estudiantes del grupo obtenida correctamente`],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  //Eliminar asignación de estudiante a grupo
  deleteAssignment: async (req, res) => {
    try {
      const { student_id, group_id, academic_year } = req.params;
      if (!student_id || !group_id || !academic_year) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Faltan parámetros obligatorios"],
        });
      }
      // Buscar la asignación
      const assignment = await prisma.student_group.findFirst({
        where: {
          student_id: parseInt(student_id),
          group_id: parseInt(group_id),
          academic_year: parseInt(academic_year),
        },
      });
      if (!assignment) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: [
            "No se encontró la asignación del estudiante al grupo en ese año académico",
          ],
        });
      }
      // Eliminar la asignación principal
      await prisma.student_group.delete({
        where: { id: assignment.id },
      });
      // Eliminar asignaciones relacionadas en teacher_subject_group si existen
      await prisma.teacher_subject_group.deleteMany({
        where: {
          group_id: parseInt(group_id),
          teacher_id: parseInt(student_id), // Si el estudiante es también maestro en ese grupo
        },
      });
      res.status(200).json({
        status: "success",
        msg: ["Asignación eliminada correctamente"],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
};

export default student_groupController;
