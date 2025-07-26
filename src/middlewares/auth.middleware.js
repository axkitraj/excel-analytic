import { verify } from "../utils/jwt.js";

export default function protect(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    req.user = verify(token);
    next();
  } catch {
    res.status(401).json({ msg: "Please log in to continue." });
  }
}
