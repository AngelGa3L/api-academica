import { PrismaClient } from "../generated/prisma/index.js";
import { validationResult } from "express-validator";

const prisma = new PrismaClient();

// Función para convertir string de tiempo a Date
const timeStringToDate = (timeString) => {
  // Crear una fecha base (cualquier fecha sirve, solo importa la hora)
  const baseDate = new Date('1970-01-01');
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  baseDate.setHours(hours, minutes, seconds || 0, 0);
  return baseDate;
};

const schedulesController = {
  // Crear un nuevo horario
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: "error",
          data: {},
          msg: "Datos de entrada inválidos",
          errors: errors.array()
        });
      }

      const { weekday, start_time, end_time } = req.body;

      const startTimeDate = timeStringToDate(start_time);
      const endTimeDate = timeStringToDate(end_time);

      if (startTimeDate >= endTimeDate) {
        return res.status(400).json({ 
          status: "error",
          data: {},
          msg: "La hora de inicio debe ser menor a la hora de fin"
        });
      }

      const schedule = await prisma.schedules.create({
        data: {
          weekday,
          start_time: startTimeDate,
          end_time: endTimeDate
        }
      });

      res.status(201).json({
        status: "success",
        data: { schedule },
        msg: "Horario creado exitosamente"
      });
    } catch (error) {
      console.error("Error al crear horario:", error);
      res.status(500).json({ 
        status: "error",
        data: {},
        msg: "Error interno del servidor"
      });
    }
  },

  // Obtener todos los horarios
  getAll: async (req, res) => {
    try {
      const schedules = await prisma.schedules.findMany({
        orderBy: [
          { weekday: 'asc' },
          { start_time: 'asc' }
        ]
      });

      res.status(200).json({
        status: "success",
        data: { schedules },
        msg: "Horarios obtenidos exitosamente"
      });
    } catch (error) {
      console.error("Error al obtener horarios:", error);
      res.status(500).json({ 
        status: "error",
        data: {},
        msg: "Error interno del servidor"
      });
    }
  },

  // Obtener un horario por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const schedule = await prisma.schedules.findUnique({
        where: {
          id: parseInt(id)
        }
      });

      if (!schedule) {
        return res.status(404).json({ 
          status: "error",
          data: {},
          msg: "Horario no encontrado"
        });
      }

      res.status(200).json({
        status: "success",
        data: { schedule },
        msg: "Horario obtenido exitosamente"
      });
    } catch (error) {
      console.error("Error al obtener horario:", error);
      res.status(500).json({ 
        status: "error",
        data: {},
        msg: "Error interno del servidor"
      });
    }
  },

  // Actualizar un horario
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: "error",
          data: {},
          msg: "Datos de entrada inválidos",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { weekday, start_time, end_time } = req.body;

      const existingSchedule = await prisma.schedules.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingSchedule) {
        return res.status(404).json({ 
          status: "error",
          data: {},
          msg: "Horario no encontrado"
        });
      }

      if (!weekday && !start_time && !end_time) {
        return res.status(400).json({ 
          status: "error",
          data: {},
          msg: "Debe proporcionar al menos un campo para actualizar"
        });
      }

      const updateData = {};

      if (weekday) {
        updateData.weekday = weekday;
      }

      let finalStartTime = existingSchedule.start_time;
      let finalEndTime = existingSchedule.end_time;

      if (start_time) {
        const startTimeDate = timeStringToDate(start_time);
        updateData.start_time = startTimeDate;
        finalStartTime = startTimeDate;
      }

      if (end_time) {
        const endTimeDate = timeStringToDate(end_time);
        updateData.end_time = endTimeDate;
        finalEndTime = endTimeDate;
      }

      if (finalStartTime >= finalEndTime) {
        return res.status(400).json({ 
          status: "error",
          data: {},
          msg: "La hora de inicio debe ser menor a la hora de fin"
        });
      }

      const schedule = await prisma.schedules.update({
        where: {
          id: parseInt(id)
        },
        data: updateData
      });

      res.status(200).json({
        status: "success",
        data: { schedule },
        msg: "Horario actualizado exitosamente"
      });
    } catch (error) {
      console.error("Error al actualizar horario:", error);
      res.status(500).json({ 
        status: "error",
        data: {},
        msg: "Error interno del servidor"
      });
    }
  },

  // Obtener horarios por día de la semana
  getByWeekday: async (req, res) => {
    try {
      const { weekday } = req.params;

      const schedules = await prisma.schedules.findMany({
        where: {
          weekday: weekday
        },
        orderBy: {
          start_time: 'asc'
        }
      });

      res.status(200).json({
        status: "success",
        data: { schedules },
        msg: `Horarios del ${weekday} obtenidos exitosamente`
      });
    } catch (error) {
      console.error("Error al obtener horarios por día:", error);
      res.status(500).json({ 
        status: "error",
        data: {},
        msg: "Error interno del servidor"
      });
    }
  }
};

export default schedulesController;
