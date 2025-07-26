import bcrypt from "bcrypt";
export const hash = (pw) => bcrypt.hash(pw, 10);
export const compare = (pw, hash) => bcrypt.compare(pw, hash);
