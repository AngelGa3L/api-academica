import jwt from 'jsonwebtoken';
const secretKey = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: "error", data:{}, msg: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ status: "error", data:{}, msg: 'Token inválido' });
  }
};

export default verifyToken;