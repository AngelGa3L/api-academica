import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const classroomsController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { name } = req.body;
      const exists = await prisma.classrooms.findFirst({
        where: { name },
      });
      if (exists) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un aula con este nombre"],
        });
      }

      const classroom = await prisma.classrooms.create({
        data: {
          name,
          is_blocked: false,
        },
      });

      return res.status(201).json({
        status: "success",
        data: classroom,
        msg: ["Aula creada exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un aula con este nombre"],
        });
      }

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
      const { name, is_blocked } = req.body;

      const classroom = await prisma.classrooms.findUnique({
        where: { id: parseInt(id) },
      });
      if (!classroom) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Aula no encontrada"],
        });
      }
      const updated = await prisma.classrooms.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(typeof is_blocked !== "undefined" && { is_blocked }),
        },
      });

      return res.status(200).json({
        status: "success",
        data: { name: updated.name, is_blocked: updated.is_blocked },
        msg: ["Aula actualizada exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Aula no encontrada"],
        });
      }

      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  getAll: async (req, res) => {
    try {
      const classrooms = await prisma.classrooms.findMany();
      return res.status(200).json({
        status: "success",
        data: classrooms,
        msg: ["Aulas obtenidas exitosamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  getByid: async (req, res) => {
    try {
      const { id } = req.params;
      const classroom = await prisma.classrooms.findUnique({
        where: { id: parseInt(id) },
      });
      if (!classroom) {
        return res
          .status(404)
          .json({ status: "error", data: {}, msg: "Aula no encontrada" });
      }
      res.status(200).json({
        status: "success",
        data: classroom,
        msg: "Aula obtenida correctamente",
      });
    } catch (error) {
      res.status(500).json({ status: "error", data: {}, msg: error.message });
    }
  },
};
export default classroomsController;
