import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

const checkIsActive = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, is_active: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        data: {},
        msg: ["Usuario no encontrado"],
      });
    }

    if (user.is_active === false) {
      return res.status(403).json({
        status: "error",
        data: {},
        msg: ["Tu cuenta ha sido desactivada. Contacta al administrador"],
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      data: {},
      msg: ["Error interno del servidor"],
    });
  }
};

export default checkIsActive;
