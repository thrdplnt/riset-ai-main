import { SignJWT, jwtVerify } from "jose";
import { JwtPayload } from "./types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const EXPIRES_IN = "7d";

export async function signJwt(payload: JwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function getExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}