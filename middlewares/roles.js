import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

//Middleware para verificar roles
const checkRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { roles: true },
      });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", data: {}, msg: "Usuario no encontrado" });
      }
      if (!allowedRoles.includes(user.roles.name.toLowerCase())) {
        return res.status(403).json({
          status: "error",
          data: {},
          msg: "Acceso denegado: No tienes permisos suficientes",
        });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        data: {},
        msg: "Error al verificar permisos",
      });
    }
  };
};

export default checkRoles;
