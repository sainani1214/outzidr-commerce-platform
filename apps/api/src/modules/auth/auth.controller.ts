import { FastifyRequest, FastifyReply } from "fastify";
import { authService, verifyToken } from "./auth.service";
import { LoginBody, RegisterBody, RefreshTokenPayload } from "./auth.types";
import { Validators } from "../../utils/validators";
import { UnauthorizedError } from "../../utils/errors";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function register(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
) {
  const { email, password, confirmPassword, name } = request.body;

  Validators.required(email, "Email");
  Validators.required(password, "Password");
  Validators.required(confirmPassword, "Confirm Password");
  Validators.required(name, "Name");
  Validators.passwordMatch(password, confirmPassword);

  const user = await authService.register({
    email,
    password,
    name,
    tenantId: request.tenantId,
  });

  
  const { tokens } = await authService.login({
    email,
    password,
    tenantId: request.tenantId,
  });

  const userData = user.toUserObject();

  return reply
    .code(201)
    .setCookie("accessToken", tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    })
    .setCookie("refreshToken", tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60,
    })
    .send({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
}

export async function login(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  Validators.required(email, "Email");
  Validators.required(password, "Password");

  const { user, tokens } = await authService.login({
    email,
    password,
    tenantId: request.tenantId,
  });

  const userData = user.toUserObject();

  return reply
    .setCookie("accessToken", tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    })
    .setCookie("refreshToken", tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60,
    })
    .send({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
}

export async function refresh(request: FastifyRequest<{ Body: { refreshToken?: string } }>, reply: FastifyReply) {
  // Support both cookie and body
  const oldToken = request.body.refreshToken || request.cookies.refreshToken;

  if (!oldToken) {
    throw new UnauthorizedError("No refresh token provided");
  }

  const payload = verifyToken<RefreshTokenPayload>(oldToken);
  const tokens = await authService.refreshTokens(payload);

  return reply
    .setCookie("accessToken", tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60,
    })
    .setCookie("refreshToken", tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60,
    })
    .send({ 
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
}

export async function logout(request: FastifyRequest<{ Body: { refreshToken?: string } }>, reply: FastifyReply) {
  // Support both cookie and body
  const refreshToken = request.body.refreshToken || request.cookies.refreshToken;

  if (refreshToken) {
    try {
      const payload = verifyToken<RefreshTokenPayload>(refreshToken);
      await authService.revokeRefreshToken(payload.tokenId);
    } catch (err) {
      request.log.warn({ err }, "Token revocation failed during logout");
    }
  }

  return reply
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .send({ 
      success: true,
      message: "Logged out successfully"
    });
}
