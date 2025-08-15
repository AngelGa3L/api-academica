//const { PrismaClient } = require('../generated/prisma');
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Resend } from "resend";

const secretKey = process.env.JWT_SECRET_KEY;
const prisma = new PrismaClient();

const usersController = {
  // Crear usuario
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
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
        status: "success",
        msg: "Usuario creado",
        data: { id: user.id, email: user.email },
      });
    } catch (error) {
      res.status(400).json({ status: "error", data: {}, msg: error.message });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((validations) => validations.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    try {
      const { email, password, client } = req.body;
      const user = await prisma.users.findUnique({
        where: { email },
        include: { roles: true },
      });

      const invalidCredentials = "Correo o contraseña incorrectos";

      if (!user)
        return res
          .status(401)
          .json({ status: "error", data: {}, msg: [invalidCredentials] });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res
          .status(401)
          .json({ status: "error", data: {}, msg: [invalidCredentials] });

      if (user.is_active === false) {
        return res.status(403).json({
          status: "error",
          data: {},
          msg: ["Usuario inactivo. No tienes permisos para acceder."],
        });
      }
      const role = user.roles.name.toLowerCase();
      if (
        (client === "web" && !["admin", "secretary"].includes(role)) ||
        (client === "mobile" && role !== "student") ||
        (client === "desktop" && role !== "teacher")
      ) {
        return res.status(403).json({
          status: "error",
          data: {},
          msg: ["Acceso denegado para este tipo de usuario"],
        });
      }
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const hashedCode = await bcrypt.hash(verificationCode, 10);
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.users.update({
        where: { id: user.id },
        data: {
          verification_code: hashedCode,
          verification_code_expires: expires,
        },
      });
      await prisma.users.update({
        where: { id: user.id },
        data: {
          verification_code: hashedCode,
          verification_code_expires: expires,
        },
      });

      /*const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Tu código de verificación",
        text: `Tu código de verificación es: ${verificationCode}`,
      });*/
      const resend = new Resend("re_15Wdmav8_JhutMuqDKqt85VSM5iF34Aei");
      const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center;">🔐 SmartEntry</h2>
      <p style="font-size: 16px; color: #333;">Hola,</p>
      <p style="font-size: 16px; color: #333;">
        Tu código de verificación es:
      </p>
      <div style="font-size: 28px; font-weight: bold; text-align: center; color: #1a73e8; margin: 20px 0;">
        ${verificationCode}
      </div>
      <p style="font-size: 14px; color: #888;">
        Si no solicitaste este código, puedes ignorar este correo.
      </p>
      <p style="font-size: 14px; color: #888;">Gracias,<br>El equipo de SmartEntry</p>
    </div>
  </div>
`;

      resend.emails.send({
        from: "SmartEntry <no-reply@smartentry.space>",
        to: user.email,
        subject: "Tu código de verificación",
        html: htmlContent,
      });

      return res.status(200).json({
        status: "success",
        data: { id: user.id, email: user.email },
        msg: "Se ha enviado un código de verificación de 6 dígitos.",
      });
    } catch (error) {
      res.status(500).json({ status: "error", data: {}, msg: error.message });
    }
  },
  verify2fa: async (req, res) => {
    try {
      const { email, code } = req.body;
      const user = await prisma.users.findUnique({
        where: { email },
        include: { roles: true },
      });

      if (!user || !user.verification_code || !user.verification_code_expires) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "No hay código de verificación generado.",
        });
      }
      if (new Date() > user.verification_code_expires) {
        return res
          .status(400)
          .json({ status: "error", data: {}, msg: "El código ha expirado." });
      }
      const codeValid = await bcrypt.compare(code, user.verification_code);
      if (!codeValid) {
        return res
          .status(400)
          .json({ status: "error", data: {}, msg: "Código incorrecto." });
      }

      await prisma.users.update({
        where: { id: user.id },
        data: {
          verification_code: null,
          verification_code_expires: null,
        },
      });

      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: "10h",
      });
      res.status(200).json({
        status: "success",
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          token,
        },
        msg: "Login exitoso",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, role_id, is_active, password } =
        req.body;

      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", data: {}, msg: "Usuario no encontrado" });
      }
      let hashedPassword;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const updated = await prisma.users.update({
        where: { id: parseInt(id) },
        data: {
          ...(first_name && { first_name }),
          ...(last_name && { last_name }),
          ...(email && { email }),
          ...(role_id && { role_id: parseInt(role_id) }),
          ...(typeof is_active !== "undefined" && { is_active }),
          ...(password && { password: hashedPassword }),
        },
      });

      res.status(200).json({
        status: "success",
        data: { email: updated.email },
        msg: "Usuario actualizado correctamente",
      });
    } catch (error) {
      res.status(400).json({ status: "error", data: {}, msg: error.message });
    }
  },

  //Ruta para obtener todos los usuarios
  getAll: async (req, res) => {
    try {
      const users = await prisma.users.findMany({
        include: { roles: true },
      });
      res.status(200).json({
        status: "success",
        data: users,
        msg: "Lista de usuarios obtenida correctamente",
      });
    } catch (error) {
      res.status(500).json({ status: "error", data: {}, msg: error.message });
    }
  },
  //Ruta para un usuario por id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) },
        include: { roles: true },
      });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", data: {}, msg: "Usuario no encontrado" });
      }
      res.status(200).json({
        status: "success",
        data: user,
        msg: "Usuario obtenido correctamente",
      });
    } catch (error) {
      res.status(500).json({ status: "error", data: {}, msg: error.message });
    }
  },
  getByRole: async (req, res) => {
    try {
      const { role_id } = req.params;

      const role = await prisma.roles.findUnique({
        where: { id: parseInt(role_id) },
      });

      if (!role) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: ["Rol no encontrado"],
        });
      }
      const users = await prisma.users.findMany({
        where: { role_id: parseInt(role_id) },
        include: { 
          roles: true,
          student_group: {
            include: {
              groups: {
                select: {
                  id: true,
                  name: true,
                  grade: true,
                },
              },
            },
          },
        },
        orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
      });

      if (users.length === 0) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: [`No se encontraron usuarios con el rol ${role.name}`],
        });
      }
      res.status(200).json({
        status: "success",
        data: users,
        msg: [`Usuarios obtenidos correctamente`],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: {},
        msg: [error.message],
      });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await prisma.users.findUnique({
        where: { email },
        include: { roles: true },
      });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", data: {}, msg: "Usuario no encontrado" });
      }
      if (user.roles && user.roles.name.toLowerCase() === "student") {
        return res.status(403).json({
          status: "error",
          data: {},
          msg: "No tienes permisos para recuperar la contraseña.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.users.update({
        where: { id: user.id },
        data: {
          reset_password_token: token,
          reset_password_expires: expires,
        },
      });

      /*const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const resetUrl = `http://localhost:3000/api/reset-password?token=${token}&email=${email}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Recupera tu contraseña",
        text: `Haz clic en el siguiente enlace para recuperar tu contraseña: ${resetUrl}`,
        html: `<p>Haz clic en el siguiente <a href="${resetUrl}">enlace para recuperar tu contraseña</a>.</p>`,
      });*/
      const resend = new Resend("re_15Wdmav8_JhutMuqDKqt85VSM5iF34Aei");
      const resetUrl = `https://smartentry.space/reset-password?token=${token}&email=${email}`;
      const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center;">🔒 Recuperar contraseña</h2>
      <p style="font-size: 16px; color: #333;">Hola,</p>
      <p style="font-size: 16px; color: #333;">
        Recibimos una solicitud para restablecer tu contraseña.
      </p>
      <p style="font-size: 16px; color: #333;">
        Haz clic en el siguiente botón o enlace:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #1a73e8; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">Restablecer contraseña</a>
      </div>
      <p style="font-size: 14px; color: #888;">Este enlace expirará en 1 hora. Si no fuiste tú, puedes ignorar este correo.</p>
      <p style="font-size: 14px; color: #888;">– El equipo de SmartEntry</p>
    </div>
  </div>
`;
      await resend.emails.send({
        from: "SmartEntry <no-reply@smartentry.space>",
        to: user.email,
        subject: "Recupera tu contraseña",
        html: htmlContent,
      });
      res.status(200).json({
        status: "success",
        data: {},
        msg: "Correo de recuperación enviado",
      });
    } catch (error) {
      res.status(500).json({ status: "error", msg: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      const user = await prisma.users.findUnique({ where: { email } });

      if (
        !user ||
        !user.reset_password_token ||
        user.reset_password_token !== token ||
        !user.reset_password_expires ||
        new Date() > user.reset_password_expires
      ) {
        return res.status(400).json({
          status: "error",
          data: {},
          msg: "Token inválido o expirado",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_password_token: null,
          reset_password_expires: null,
        },
      });

      res.status(200).json({
        status: "success",
        msg: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      res.status(500).json({ status: "error", data: {}, msg: error.message });
    }
  },
  resendcode: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await prisma.users.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({
          status: "error",
          data: {},
          msg: "Usuario no encontrado",
        });
      }
      if (user.roles && user.roles.name.toLowerCase() === "student") {
        return res.status(403).json({
          status: "error",
          data: {},
          msg: "No tienes permisos para recuperar la contraseña.",
        });
      }
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const hashedCode = await bcrypt.hash(verificationCode, 10);
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.users.update({
        where: { id: user.id },
        data: {
          verification_code: hashedCode,
          verification_code_expires: expires,
        },
      });
      const resend = new Resend("re_15Wdmav8_JhutMuqDKqt85VSM5iF34Aei");
      const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center;">🔐 Verificación de cuenta</h2>
      <p style="font-size: 16px; color: #333;">Hola,</p>
      <p style="font-size: 16px; color: #333;">
        Tu código de verificación es:
      </p>
      <div style="font-size: 28px; font-weight: bold; text-align: center; color: #1a73e8; margin: 20px 0;">
        ${verificationCode}
      </div>
      <p style="font-size: 14px; color: #888;">Gracias por usar SmartEntry</p>
    </div>
  </div>
`;
      await resend.emails.send({
        from: "SmartEntry <no-reply@smartentry.space>",
        to: email,
        subject: "Tu código de verificación",
        html: htmlContent,
      });
      /*const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Tu código de verificación",
        text: `Tu código de verificación es: ${verificationCode}`,
      });*/

      res.status(200).json({
        status: "success",
        data: {},
        msg: "Se ha reenviado el código de verificación.",
      });
    } catch (error) {
      res.status(500).json({ status: "error", data: {}, msg: error.message });
    }
  },
};

export default usersController;
