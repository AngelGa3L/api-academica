import { response } from "express";
import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";
const prisma = new PrismaClient();

const sensorsController = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { name, esp32_code, type, classroom_id } = req.body;
      const isExist = await prisma.sensors.findFirst({
        where: { esp32_code },
      });
      if (isExist) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un sensor con este código"],
        });
      }
      const sensor = await prisma.sensors.create({
        data: {
          name,
          esp32_code,
          type,
          classroom_id,
        },
      });
      return res.status(201).json({
        status: "success",
        data: sensor,
        msg: ["Sensor creado exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un sensor con este código"],
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
      const { name, esp32_code, type, classroom_id } = req.body;

      const sensor = await prisma.sensors.findUnique({
        where: { id: parseInt(id) },
      });
      if (!sensor) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Sensor no encontrado"],
        });
      }

      // Validar que el nuevo código no esté repetido en otro sensor
      if (esp32_code) {
        const exists = await prisma.sensors.findFirst({
          where: {
            esp32_code,
            id: { not: parseInt(id) },
          },
        });
        if (exists) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: ["Ya existe un sensor con este código"],
          });
        }
      }

      const updated = await prisma.sensors.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(esp32_code && { esp32_code }),
          ...(type && { type }),
          ...(classroom_id && { classroom_id }),
        },
      });

      return res.status(200).json({
        status: "success",
        data: updated,
        msg: ["Sensor actualizado exitosamente"],
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
      const sensors = await prisma.sensors.findMany({
        orderBy: { id: "asc" },
      });
      return res.status(200).json({
        status: "success",
        data: sensors,
        msg: ["Lista de sensores obtenida correctamente"],
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
export default sensorsController;
