import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();
function generateRFIDUid(length = 8) {
  const chars = "ABCDEF0123456789";
  let uid = "";
  for (let i = 0; i < length; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}
const rfidsController = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      let { uid, user_id } = req.body;
      if (!uid) {
        uid = generateRFIDUid(8 + Math.floor(Math.random() * 13)); // 8 a 20 caracteres
      }
      const user = await prisma.users.findUnique({
        where: { id: Number(user_id) },
      });
      if (!user) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["El usuario no existe"],
        });
      }
      const existing = await prisma.rfid_cards.findFirst({
        where: { user_id: Number(user_id) },
      });
      if (existing) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["El usuario ya tiene una tarjeta RFID asignada"],
        });
      }

      const rfid = await prisma.rfid_cards.create({
        data: {
          uid,
          user_id,
        },
      });

      return res.status(201).json({
        status: "success",
        data: rfid,
        msg: ["RFID registrado exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un RFID con este UID"],
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
      const rfids = await prisma.rfid_cards.findMany();
      return res.status(200).json({
        status: "success",
        data: rfids,
        msg: ["Listado de todas las tarjetas RFID"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  getByUser: async (req, res) => {
    const { user_id } = req.params;
    try {
      const rfids = await prisma.rfid_cards.findMany({
        where: { user_id: Number(user_id) },
      });
      if (!rfids || rfids.length === 0) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["El usuario no tiene tarjetas RFID asignadas"],
        });
      }
      return res.status(200).json({
        status: "success",
        data: rfids,
        msg: ["Listado de tarjetas RFID del estudiante"],
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
    const { id } = req.params;
    const { uid, user_id } = req.body;
    try {
      if (user_id !== undefined) {
        const user = await prisma.users.findUnique({
          where: { id: Number(user_id) },
        });
        if (!user) {
          return res.status(404).json({
            status: "error",
            data: {},
            msg: ["El usuario no existe"],
          });
        }
        const existing = await prisma.rfid_cards.findFirst({
          where: {
            user_id: Number(user_id),
            NOT: { id: Number(id) },
          },
        });
        if (existing) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: ["El usuario ya tiene una tarjeta RFID asignada"],
          });
        }
      }
      const rfid = await prisma.rfid_cards.update({
        where: { id: Number(id) },
        data: { uid, user_id },
      });
      return res.status(200).json({
        status: "success",
        data: rfid,
        msg: ["RFID actualizado exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe un RFID con este UID"],
        });
      }
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const rfid = await prisma.rfid_cards.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({
        status: "success",
        data: rfid,
        msg: ["RFID eliminado exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["No se encontró la tarjeta RFID"],
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
export default rfidsController;
