import jwt from "jsonwebtoken";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY!, {
    algorithm: "RS256",
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(payload: object, tokenId: string) {
  return jwt.sign(
    { ...payload, tokenId },
    process.env.JWT_PRIVATE_KEY!,
    {
      algorithm: "RS256",
      expiresIn: REFRESH_TOKEN_TTL,
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY!);
}
