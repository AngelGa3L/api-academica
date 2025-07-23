import express from "express";
import usersController from "../controllers/usersController.js";
import verifyToken from "../middlewares/auth.js";
import { body, validationResult } from "express-validator";
import checkRoles from "../middlewares/roles.js";
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
        "La contraseña debe contener al menos 8 carateres de longitud, un caracter especial, una minúscula, una mayúscula y un número"
      ),
    body("role_id")
      .isInt()
      .withMessage("El rol es obligatorio y debe ser un número"),
  ],
  checkRoles(["admin", "secretary"]),
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

//Ruta para editar usuario
router.put(
  "/update/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  [
    body("first_name")
      .optional()
      .notEmpty()
      .withMessage("El nombre es obligatorio"),
    body("last_name")
      .optional()
      .notEmpty()
      .withMessage("El apellido es obligatorio"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Email inválido")
      .custom(async (email, { req }) => {
        const user = await prisma.users.findUnique({ where: { email } });
        if (user && user.id !== parseInt(req.params.id)) {
          throw new Error("El email ya está en uso");
        }
        return true;
      }),
    body("role_id").optional().isInt().withMessage("El rol debe ser un número"),
    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("El estado debe ser booleano"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .withMessage(
        "La contraseña debe contener al menos 8 carateres de longitud, un caracter especial, una minúscula, una mayúscula y un número"
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg);
      return res.status(400).json({ status: "error", data: {}, msg: messages });
    }
    next();
  },
  usersController.update
);

router.get(
  "/users",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  usersController.getAll
);

router.get(
  "/users/:id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  usersController.getById
);

router.get(
  "/users/roles/:role_id",
  verifyToken,
  checkRoles(["admin", "secretary"]),
  usersController.getByRole
);

router.post(
  "/users/verify",
  [
    body("email")
      .isEmail()
      .withMessage("Formato de email inválido")
      .notEmpty()
      .withMessage("Email es obligatorio"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("El código debe tener 6 dígitos")
      .notEmpty()
      .withMessage("El código es obligatorio"),
  ],
  usersController.verify2fa
);
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Formato de email inválido")
      .notEmpty()
      .withMessage("Email es obligatorio"),
  ],
  usersController.forgotPassword
);
router.post(
  "/reset-password",
  [
    body("email")
      .isEmail()
      .withMessage("Formato de email inválido")
      .notEmpty()
      .withMessage("Email es obligatorio"),
    body("token").notEmpty().withMessage("El token es obligatorio"),
    body("newPassword")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      .withMessage(
        "La contraseña debe contener al menos 8 carateres de longitud, un caracter especial, una minúscula, una mayúscula y un número"
      ),
  ],
  usersController.resetPassword
);
router.post("/resend", usersController.resendcode);

export default router;
