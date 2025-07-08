import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const teacherSubjectGroupController = {
  // Crear una nueva asignación teacher-subject-group
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { teacher_id, subject_id, group_id, classroom_id, schedule_id } =
        req.body;

      const [teacher, subject, group, classroom, schedule] = await Promise.all([
        prisma.users.findUnique({ where: { id: teacher_id } }),
        prisma.subjects.findUnique({ where: { id: subject_id } }),
        prisma.groups.findUnique({ where: { id: group_id } }),
        prisma.classrooms.findUnique({ where: { id: classroom_id } }),
        prisma.schedules.findUnique({ where: { id: schedule_id } }),
      ]);

      if (!teacher) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "El profesor especificado no existe",
        });
      }

      if (!subject) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "La materia especificada no existe",
        });
      }

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "El grupo especificado no existe",
        });
      }

      if (!classroom) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "El aula especificada no existe",
        });
      }

      if (!schedule) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "El horario especificado no existe",
        });
      }

      const existingAssignment = await prisma.teacher_subject_group.findFirst({
        where: {
          teacher_id,
          subject_id,
          group_id,
          schedule_id,
        },
      });

      if (existingAssignment) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "Ya existe una asignación con estos datos",
        });
      }

      const conflictingTeacherSchedule =
        await prisma.teacher_subject_group.findFirst({
          where: {
            teacher_id,
            schedule_id,
            NOT: { id: undefined },
          },
        });

      if (conflictingTeacherSchedule) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "El profesor ya tiene una clase asignada en este horario",
        });
      }

      const conflictingClassroomSchedule =
        await prisma.teacher_subject_group.findFirst({
          where: {
            classroom_id,
            schedule_id,
            NOT: { id: undefined },
          },
        });

      if (conflictingClassroomSchedule) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "El aula ya está ocupada en este horario",
        });
      }

      const teacherSubjectGroup = await prisma.teacher_subject_group.create({
        data: {
          teacher_id,
          subject_id,
          group_id,
          classroom_id,
          schedule_id,
        },
        include: {
          users: { select: { id: true, first_name: true, last_name: true } },
          subjects: { select: { id: true, name: true, code: true } },
          groups: { select: { id: true, name: true, grade: true } },
          classrooms: { select: { id: true, name: true } },
          schedules: {
            select: {
              id: true,
              weekday: true,
              start_time: true,
              end_time: true,
            },
          },
        },
      });

      res.status(201).json({
        status: "success",
        data: { teacherSubjectGroup },
        msg: "Asignación creada exitosamente",
      });
    } catch (error) {
      console.error("Error al crear asignación:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },

  // Obtener todas las asignaciones
  getAll: async (req, res) => {
    try {
      const teacherSubjectGroups = await prisma.teacher_subject_group.findMany({
        include: {
          users: { select: { id: true, first_name: true, last_name: true } },
          subjects: { select: { id: true, name: true, code: true } },
          groups: { select: { id: true, name: true, grade: true } },
          classrooms: { select: { id: true, name: true } },
          schedules: {
            select: {
              id: true,
              weekday: true,
              start_time: true,
              end_time: true,
            },
          },
        },
        orderBy: [
          { schedules: { weekday: "asc" } },
          { schedules: { start_time: "asc" } },
        ],
      });

      res.status(200).json({
        status: "success",
        data: { teacherSubjectGroups },
        msg: "Asignaciones obtenidas exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },

  // Obtener asignación por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const teacherSubjectGroup = await prisma.teacher_subject_group.findUnique(
        {
          where: { id: parseInt(id) },
          include: {
            users: { select: { id: true, first_name: true, last_name: true } },
            subjects: { select: { id: true, name: true, code: true } },
            groups: { select: { id: true, name: true, grade: true } },
            classrooms: { select: { id: true, name: true } },
            schedules: {
              select: {
                id: true,
                weekday: true,
                start_time: true,
                end_time: true,
              },
            },
          },
        }
      );

      if (!teacherSubjectGroup) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "Asignación no encontrada",
        });
      }

      res.status(200).json({
        status: "success",
        data: { teacherSubjectGroup },
        msg: "Asignación obtenida exitosamente",
      });
    } catch (error) {
      console.error("Error al obtener asignación:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },

  // Actualizar asignación
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { teacher_id, subject_id, group_id, classroom_id, schedule_id } =
        req.body;

      const existingAssignment = await prisma.teacher_subject_group.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingAssignment) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "Asignación no encontrada",
        });
      }

      if (
        !teacher_id &&
        !subject_id &&
        !group_id &&
        !classroom_id &&
        !schedule_id
      ) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      const updateData = {};
      if (teacher_id !== undefined) updateData.teacher_id = teacher_id;
      if (subject_id !== undefined) updateData.subject_id = subject_id;
      if (group_id !== undefined) updateData.group_id = group_id;
      if (classroom_id !== undefined) updateData.classroom_id = classroom_id;
      if (schedule_id !== undefined) updateData.schedule_id = schedule_id;

      if (teacher_id) {
        const teacher = await prisma.users.findUnique({
          where: { id: teacher_id },
        });
        if (!teacher) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: "El profesor especificado no existe",
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
            msg: "La materia especificada no existe",
          });
        }
      }

      if (group_id) {
        const group = await prisma.groups.findUnique({
          where: { id: group_id },
        });
        if (!group) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: "El grupo especificado no existe",
          });
        }
      }

      if (classroom_id) {
        const classroom = await prisma.classrooms.findUnique({
          where: { id: classroom_id },
        });
        if (!classroom) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: "El aula especificada no existe",
          });
        }
      }

      if (schedule_id) {
        const schedule = await prisma.schedules.findUnique({
          where: { id: schedule_id },
        });
        if (!schedule) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: "El horario especificado no existe",
          });
        }
      }

      const finalTeacherId = teacher_id || existingAssignment.teacher_id;
      const finalScheduleId = schedule_id || existingAssignment.schedule_id;
      const finalClassroomId = classroom_id || existingAssignment.classroom_id;

      if (teacher_id || schedule_id) {
        const conflictingTeacherSchedule =
          await prisma.teacher_subject_group.findFirst({
            where: {
              teacher_id: finalTeacherId,
              schedule_id: finalScheduleId,
              NOT: { id: parseInt(id) },
            },
          });

        if (conflictingTeacherSchedule) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: "El profesor ya tiene una clase asignada en este horario",
          });
        }
      }

      if (classroom_id || schedule_id) {
        const conflictingClassroomSchedule =
          await prisma.teacher_subject_group.findFirst({
            where: {
              classroom_id: finalClassroomId,
              schedule_id: finalScheduleId,
              NOT: { id: parseInt(id) },
            },
          });

        if (conflictingClassroomSchedule) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: "El aula ya está ocupada en este horario",
          });
        }
      }

      const teacherSubjectGroup = await prisma.teacher_subject_group.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          users: { select: { id: true, first_name: true, last_name: true } },
          subjects: { select: { id: true, name: true, code: true } },
          groups: { select: { id: true, name: true, grade: true } },
          classrooms: { select: { id: true, name: true } },
          schedules: {
            select: {
              id: true,
              weekday: true,
              start_time: true,
              end_time: true,
            },
          },
        },
      });

      res.status(200).json({
        status: "success",
        data: { teacherSubjectGroup },
        msg: "Asignación actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar asignación:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },

  // Eliminar asignación
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existingAssignment = await prisma.teacher_subject_group.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingAssignment) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "Asignación no encontrada",
        });
      }

      await prisma.teacher_subject_group.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        status: "success",
        data: {},
        msg: "Asignación eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar asignación:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },

  getByTeacher: async (req, res) => {
    try {
      const { teacher_id } = req.params;

      const teacherSubjectGroups = await prisma.teacher_subject_group.findMany({
        where: { teacher_id: parseInt(teacher_id) },
        include: {
          users: { select: { id: true, first_name: true, last_name: true } },
          subjects: { select: { id: true, name: true, code: true } },
          groups: { select: { id: true, name: true, grade: true } },
          classrooms: { select: { id: true, name: true } },
          schedules: {
            select: {
              id: true,
              weekday: true,
              start_time: true,
              end_time: true,
            },
          },
        },
        orderBy: [
          { schedules: { weekday: "asc" } },
          { schedules: { start_time: "asc" } },
        ],
      });

      res.status(200).json({
        status: "success",
        data: { teacherSubjectGroups },
        msg: `Asignaciones del profesor obtenidas exitosamente`,
      });
    } catch (error) {
      console.error("Error al obtener asignaciones por profesor:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },

  // Obtener asignaciones por grupo
  getByGroup: async (req, res) => {
    try {
      const { group_id } = req.params;

      const teacherSubjectGroups = await prisma.teacher_subject_group.findMany({
        where: { group_id: parseInt(group_id) },
        include: {
          users: { select: { id: true, first_name: true, last_name: true } },
          subjects: { select: { id: true, name: true, code: true } },
          groups: { select: { id: true, name: true, grade: true } },
          classrooms: { select: { id: true, name: true } },
          schedules: {
            select: {
              id: true,
              weekday: true,
              start_time: true,
              end_time: true,
            },
          },
        },
        orderBy: [
          { schedules: { weekday: "asc" } },
          { schedules: { start_time: "asc" } },
        ],
      });

      res.status(200).json({
        status: "success",
        data: { teacherSubjectGroups },
        msg: `Asignaciones del grupo obtenidas exitosamente`,
      });
    } catch (error) {
      console.error("Error al obtener asignaciones por grupo:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error interno del servidor",
      });
    }
  },
  getByStudent: async (req, res) => {
    try {
      const { student_id } = req.params;
      const studentGroup = await prisma.student_group.findFirst({
        where: { student_id: parseInt(student_id) },
        include: { groups: true },
      });

      if (!studentGroup) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Estudiante no asignado a ningún grupo"],
        });
      }

      const teacherSubjectGroups = await prisma.teacher_subject_group.findMany({
        where: { group_id: studentGroup.group_id },
        include: {
          users: { select: { id: true, first_name: true, last_name: true } },
          subjects: { select: { id: true, name: true, code: true } },
          groups: { select: { id: true, name: true, grade: true } },
          classrooms: { select: { id: true, name: true } },
          schedules: {
            select: {
              id: true,
              weekday: true,
              start_time: true,
              end_time: true,
            },
          },
        },
        orderBy: [
          { schedules: { weekday: "asc" } },
          { schedules: { start_time: "asc" } },
        ],
      });

      res.status(200).json({
        status: "success",
        data: {
          student_group: studentGroup.groups,
          schedule: teacherSubjectGroups,
        },
        msg: ["Horario del estudiante obtenido exitosamente"],
      });
    } catch (error) {
      console.error("Error al obtener horario por estudiante:", error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: ["Error interno del servidor"],
      });
    }
  },
};

export default teacherSubjectGroupController;
