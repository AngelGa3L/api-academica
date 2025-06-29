import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const groupsController = {
  // Crear grupo
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }

    try {
      const { name, grade } = req.body;

      // Verificar si el grupo ya existe
      const existingGroup = await prisma.groups.findFirst({
        where: { name },
      });

      if (existingGroup) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un grupo con ese nombre"],
        });
      }

      const group = await prisma.groups.create({
        data: {
          name,
          grade: grade || null,
        },
      });

      res.status(201).json({
        status: "success",
        msg: "Grupo creado exitosamente",
        data: { id: group.id, name: group.name, grade: group.grade },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  //Editar grupo
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }

    try {
      const { id } = req.params;
      const { name, grade } = req.body;

      // Verificar si el grupo existe
      const group = await prisma.groups.findUnique({
        where: { id: parseInt(id) },
      });

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Grupo no encontrado"],
        });
      }
      if (name && name !== group.name) {
        const existingGroup = await prisma.groups.findFirst({
          where: {
            name,
            id: { not: parseInt(id) },
          },
        });

        if (existingGroup) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: ["Ya existe un grupo con ese nombre"],
          });
        }
      }

      const updatedGroup = await prisma.groups.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(grade !== undefined && { grade: grade || null }),
        },
      });

      res.status(200).json({
        status: "success",
        data: {
          id: updatedGroup.id,
          name: updatedGroup.name,
          grade: updatedGroup.grade,
        },
        msg: ["Grupo actualizado correctamente"],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  //Obtener todos los grupos
  getAll: async (req, res) => {
    try {
      const groups = await prisma.groups.findMany();

      res.status(200).json({
        status: "success",
        data: groups,
        msg: ["Lista de grupos obtenida correctamente"],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  //Obtener grupo por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const group = await prisma.groups.findUnique({
        where: { id: parseInt(id) },
      });

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Grupo no encontrado"],
        });
      }

      res.status(200).json({
        status: "success",
        data: group,
        msg: ["Grupo obtenido correctamente"],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  //Eliminar grupo
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const group = await prisma.groups.findUnique({
        where: { id: parseInt(id) },
      });

      if (!group) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Grupo no encontrado"],
        });
      }

      await prisma.groups.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({
        status: "success",
        data: {},
        msg: ["Grupo eliminado correctamente"],
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

export default groupsController;
