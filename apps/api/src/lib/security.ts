import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const TOKEN_BYTES = 32;
const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
