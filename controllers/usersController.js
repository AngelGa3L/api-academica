//const { PrismaClient } = require('../generated/prisma');
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const secretKey = process.env.JWT_SECRET_KEY;
const prisma = new PrismaClient();

const usersController = {
  // Crear usuario
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ errors: messages });
    }
    try {
      const { first_name, last_name, email, password, role_id } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.users.create({
        data: {
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role_id,
        },
      });

      res.status(201).json({
        msg: "Usuario creado",
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ errors: messages });
    }
    try {
      const { email, password, client } = req.body;
      const user = await prisma.users.findUnique({ where: { email }, include: { roles: true }, });

      const invalidCredentials = "Correo o contraseña incorrectos";

      if (!user) return res.status(401).json({ errors: [invalidCredentials] });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ errors: [invalidCredentials] });

      const role = user.roles.name.toLowerCase();
      if (
        (client === "web" && !["admin", "secretary"].includes(role)) ||
        (client === "mobile" && role !== "student") ||
        (client === "desktop" && role !== "teacher")
      ) {
        return res
          .status(403)
          .json({ errors: ["Acceso denegado para este tipo de usuario"] });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: "1h",
      });
      res.json({
        msg: "Login exitoso",
        data: { id: user.id, email: user.email },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default usersController;
