import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyToken } from "./auth.service";
import { randomUUID } from "crypto";
import { RefreshToken } from "./refreshtoken.model";

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    const { email, password } = request.body;
    const tenantId = request.tenantId;

    // fake user lookup for assignment
    const user = { id: "user_1", passwordHash: await bcrypt.hash("pass", 10) };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const tokenId = randomUUID();

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId,
    });

    const refreshToken = signRefreshToken(
      { userId: user.id, tenantId },
      tokenId
    );

    await RefreshToken.create({
      userId: user.id,
      tenantId,
      tokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    reply
      .setCookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
      })
      .setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
      })
      .send({ success: true });
  });

  app.post("/auth/refresh", async (request, reply) => {
    const oldToken = request.cookies.refreshToken;
    if (!oldToken) {
      return reply.code(401).send({ error: "No refresh token provided" });
    }

    let payload: any;
    try {
      payload = verifyToken(oldToken);
    } catch (err) {
      return reply.code(401).send({ error: "Invalid token" });
    }

    const stored = await RefreshToken.findOne({
      tokenId: payload.tokenId,
      revoked: false,
    });

    if (!stored) {
      return reply.code(401).send({ error: "Token revoked" });
    }

    // revoke old token
    stored.revoked = true;
    await stored.save();

    // issue new token
    const newTokenId = randomUUID();

    const accessToken = signAccessToken({
      userId: payload.userId,
      tenantId: payload.tenantId,
    });

    const refreshToken = signRefreshToken(
      { userId: payload.userId, tenantId: payload.tenantId },
      newTokenId
    );

    await RefreshToken.create({
      userId: payload.userId,
      tenantId: payload.tenantId,
      tokenId: newTokenId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    reply
      .setCookie("accessToken", accessToken, { 
        httpOnly: true,
        sameSite: "lax",
      })
      .setCookie("refreshToken", refreshToken, { 
        httpOnly: true,
        sameSite: "lax",
      })
      .send({ success: true });
  });
}
