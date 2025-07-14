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
};
export default sensorsController;
