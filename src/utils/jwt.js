import jwt from "jsonwebtoken";
export const sign = (payload, expiresIn) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
export const verify = (token) => jwt.verify(token, process.env.JWT_SECRET);
