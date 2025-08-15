import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const restriccionsController = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { user_id, classroom_id } = req.body;

      // Verificar que el usuario existe
      const userExists = await prisma.users.findUnique({
        where: { id: parseInt(user_id) },
      });
      if (!userExists) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Usuario no encontrado"],
        });
      }

      // Verificar que el aula existe
      const classroomExists = await prisma.classrooms.findUnique({
        where: { id: parseInt(classroom_id) },
      });
      if (!classroomExists) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Aula no encontrada"],
        });
      }

      // Verificar si ya existe una restricción para este usuario y aula
      const existingRestriction = await prisma.access_restrictions.findFirst({
        where: {
          user_id: parseInt(user_id),
          classroom_id: parseInt(classroom_id),
        },
      });

      if (existingRestriction) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe una restricción para este usuario en esta aula"],
        });
      }

      const restriction = await prisma.access_restrictions.create({
        data: {
          user_id: parseInt(user_id),
          classroom_id: parseInt(classroom_id),
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
          classrooms: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json({
        status: "success",
        data: restriction,
        msg: ["Restricción de acceso creada exitosamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const restrictions = await prisma.access_restrictions.findMany({
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          classrooms: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return res.status(200).json({
        status: "success",
        data: restrictions,
        msg: ["Restricciones obtenidas exitosamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const restriction = await prisma.access_restrictions.findUnique({
        where: { id: parseInt(id) },
      });

      if (!restriction) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Restricción no encontrada"],
        });
      }

      await prisma.access_restrictions.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({
        status: "success",
        data: {},
        msg: ["Restricción eliminada exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Restricción no encontrada"],
        });
      }

      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  getByUserId: async (req, res) => {
    try {
      const { user_id } = req.params;

      const restrictions = await prisma.access_restrictions.findMany({
        where: { user_id: parseInt(user_id) },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          classrooms: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return res.status(200).json({
        status: "success",
        data: restrictions,
        msg: ["Restricciones del usuario obtenidas exitosamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  getByClassroomId: async (req, res) => {
    try {
      const { classroom_id } = req.params;

      const restrictions = await prisma.access_restrictions.findMany({
        where: { classroom_id: parseInt(classroom_id) },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          classrooms: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return res.status(200).json({
        status: "success",
        data: restrictions,
        msg: ["Restricciones del aula obtenidas exitosamente"],
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

export default restriccionsController;