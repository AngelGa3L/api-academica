import express from "express";
import usersController from "../controllers/usersController.js";
import verifyToken from "../middlewares/auth.js";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

const router = express.Router();
//Ruta para registrar usuario
router.post(
  "/register",
  verifyToken,
  [
    body("first_name").notEmpty().withMessage("El nombre es obligatorio"),
    body("last_name").notEmpty().withMessage("El apellido es obligatorio"),
    body("email")
      .isEmail()
      .withMessage("Email inválido")
      .custom(async (email) => {
        const user = await prisma.users.findUnique({ where: { email } });
        if (user) {
          throw new Error("El email ya está en uso");
        }
        return true;
      }),
    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .withMessage(
        "La contraseña debe contener al menos un caracter especial, una minúscula, una mayúscula y un número"
      ),
    body("role_id")
      .isInt()
      .withMessage("El rol es obligatorio y debe ser un número"),
  ],
  usersController.register
);

//Ruta para login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Formato de email inválido")
      .notEmpty()
      .withMessage("Email es obligatorio"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  usersController.login
);

export default router;
