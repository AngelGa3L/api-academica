import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

const subjectsController = {
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { name, code } = req.body;

      // Verificar si ya existe una materia con el mismo código
      const existingSubject = await prisma.subjects.findUnique({
        where: { code },
      });

      if (existingSubject) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe una materia con este código"],
        });
      }

      const subject = await prisma.subjects.create({
        data: {
          name,
          code,
        },
      });

      return res.status(201).json({
        status: "success",
        data: subject,
        msg: ["Materia creada exitosamente"],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe una materia con este código"],
        });
      }

      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  //Obtener todas las materias
  getAll: async (req, res) => {
    try {
      const subjects = await prisma.subjects.findMany({
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json({
        status: "success",
        data: subjects,
        msg: ["Lista de materias obtenida correctamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  // Obtener materia por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["ID de materia inválido"],
        });
      }

      const subject = await prisma.subjects.findUnique({
        where: { id: parseInt(id) },
      });

      if (!subject) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Materia no encontrada"],
        });
      }

      return res.status(200).json({
        status: "success",
        data: subject,
        msg: ["Materia obtenida correctamente"],
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },

  // Actualizar materia
  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }

    try {
      const { id } = req.params;
      const { name, code } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["ID de materia inválido"],
        });
      }
      const existingSubject = await prisma.subjects.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingSubject) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Materia no encontrada"],
        });
      }

      if (code && code !== existingSubject.code) {
        const codeExists = await prisma.subjects.findUnique({
          where: { code },
        });

        if (codeExists) {
          return res.status(400).json({
            status: "error",
            data: {},
            msg: ["Ya existe una materia con este código"],
          });
        }
      }

      const updatedSubject = await prisma.subjects.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(code && { code }),
        },
      });

      return res.status(200).json({
        status: "success",
        data: updatedSubject,
        msg: ["Materia actualizada correctamente"],
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: ["Ya existe una materia con este código"],
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

export default subjectsController;
