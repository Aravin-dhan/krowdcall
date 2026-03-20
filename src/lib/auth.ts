import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  createSession,
  createUser,
  deleteEmailVerificationTokenByHash,
  deleteEmailVerificationTokensByUserId,
  deleteExpiredEmailVerificationTokens,
  deleteExpiredPasswordResetTokens,
  deleteExpiredSessions,
  deletePasswordResetTokenByHash,
  deletePasswordResetTokensByUserId,
  deleteSessionByHash,
  deleteSessionsByUserId,
  deleteStaleAuthRateLimits,
  deleteUserById,
  getAuthRateLimitBucket,
  getEmailVerificationTokenByHash,
  getPasswordResetTokenByHash,
  getSessionByHash,
  getUserByEmail,
  getUserById,
  markUserEmailVerified,
  saveAuthRateLimitBucket,
  updateUserPassword
} from "@/lib/db";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

const SESSION_COOKIE = "cruxd_session";
const SESSION_DAYS = 30;
const EMAIL_TOKEN_HOURS = 24;
const PASSWORD_RESET_HOURS = 2;
// AUTO_VERIFY=1 skips email verification entirely (set in Vercel until domain is verified)
// AUTO_VERIFY_LOCAL=1 skips only in non-production (legacy dev flag)
const AUTO_VERIFY_LOCAL =
  process.env.AUTO_VERIFY === "1" ||
  (process.env.AUTO_VERIFY_LOCAL === "1" && process.env.NODE_ENV !== "production");

type AuthResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
  blockMs: number;
};

const authPolicies: Record<string, RateLimitPolicy> = {
  signup: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000
  },
  login: {
    limit: 10,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000
  },
  resend_verification: {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    blockMs: 60 * 60 * 1000
  },
  password_reset_request: {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    blockMs: 60 * 60 * 1000
  },
  password_reset_consume: {
    limit: 10,
    windowMs: 60 * 60 * 1000,
    blockMs: 60 * 60 * 1000
  }
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getRequestClientIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return realIp?.trim() || "unknown";
}

async function consumeRateLimit(action: keyof typeof authPolicies, keys: string[]) {
  const policy = authPolicies[action];
  const now = Date.now();
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));

  for (const key of uniqueKeys) {
    const bucket = await getAuthRateLimitBucket(action, key);

    if (!bucket) {
      await saveAuthRateLimitBucket({
        action,
        key,
        count: 1,
        windowStartedAt: new Date(now).toISOString(),
        blockedUntil: null
      });
      continue;
    }

    if (bucket.blockedUntil && new Date(bucket.blockedUntil).getTime() > now) {
      return false;
    }

    const windowStartedAt = new Date(bucket.windowStartedAt).getTime();
    const withinWindow = now - windowStartedAt < policy.windowMs;

    if (!withinWindow) {
      await saveAuthRateLimitBucket({
        action,
        key,
        count: 1,
        windowStartedAt: new Date(now).toISOString(),
        blockedUntil: null
      });
      continue;
    }

    const nextCount = bucket.count + 1;
    const blockedUntil =
      nextCount > policy.limit ? new Date(now + policy.blockMs).toISOString() : null;

    await saveAuthRateLimitBucket({
      action,
      key,
      count: nextCount,
      windowStartedAt: bucket.windowStartedAt,
      blockedUntil
    });

    if (nextCount > policy.limit) {
      return false;
    }
  }

  return true;
}

async function enforceRateLimit(action: keyof typeof authPolicies, identifier?: string) {
  await deleteStaleAuthRateLimits();
  const ip = await getRequestClientIp();
  const allowed = await consumeRateLimit(action, [
    `${action}:ip:${ip}`,
    identifier ? `${action}:id:${identifier}` : ""
  ]);

  if (!allowed) {
    return {
      ok: false,
      message: "Too many attempts from this device. Wait a bit and try again."
    } satisfies AuthResult;
  }

  return null;
}

async function createPendingToken(hoursToExpiry: number) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + hoursToExpiry * 60 * 60 * 1000).toISOString();

  return {
    token,
    tokenHash,
    expiresAt
  };
}

async function sendFreshVerificationEmail(user: {
  id: string;
  email: string;
  displayName: string;
}) {
  await deleteExpiredEmailVerificationTokens();
  const pendingToken = await createPendingToken(EMAIL_TOKEN_HOURS);

  await createEmailVerificationToken({
    userId: user.id,
    tokenHash: pendingToken.tokenHash,
    expiresAt: pendingToken.expiresAt
  });

  await sendVerificationEmail({
    email: user.email,
    displayName: user.displayName,
    token: pendingToken.token
  });
}

async function sendFreshPasswordResetEmail(user: {
  id: string;
  email: string;
  displayName: string;
}) {
  await deleteExpiredPasswordResetTokens();
  const pendingToken = await createPendingToken(PASSWORD_RESET_HOURS);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash: pendingToken.tokenHash,
    expiresAt: pendingToken.expiresAt
  });

  await sendPasswordResetEmail({
    email: user.email,
    displayName: user.displayName,
    token: pendingToken.token
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);
  const session = await getSessionByHash(tokenHash);

  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await deleteSessionByHash(tokenHash);
    return null;
  }

  return getUserById(session.userId);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  if (!user.emailVerifiedAt) {
    redirect("/auth?verify=required");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/app");
  }

  return user;
}

export async function registerUser(input: {
  email: string;
  displayName: string;
  password: string;
}): Promise<AuthResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const rateLimit = await enforceRateLimit("signup", normalizedEmail);

  if (rateLimit) {
    return rateLimit;
  }

  const existing = await getUserByEmail(normalizedEmail);

  if (existing) {
    return { ok: false, message: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(input.password);
  const shouldAutoVerify = AUTO_VERIFY_LOCAL;
  const user = await createUser({
    email: normalizedEmail,
    displayName,
    passwordHash,
    emailVerifiedAt: shouldAutoVerify ? new Date().toISOString() : null
  });

  if (shouldAutoVerify) {
    await createUserSession(user.id);
    return { ok: true, message: "" };
  }

  try {
    await sendFreshVerificationEmail(user);
  } catch {
    await deleteUserById(user.id);
    return {
      ok: false,
      message: "Could not send the verification email. Configure email delivery and try again."
    };
  }

  return {
    ok: true,
    message: "Check your email to verify the account before signing in."
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const rateLimit = await enforceRateLimit("login", normalizedEmail);

  if (rateLimit) {
    return rateLimit;
  }

  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    return { ok: false, message: "Invalid email or password." };
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (!valid) {
    return { ok: false, message: "Invalid email or password." };
  }

  if (!user.emailVerifiedAt && AUTO_VERIFY_LOCAL) {
    await markUserEmailVerified(user.id);
  }

  if (!user.emailVerifiedAt && !AUTO_VERIFY_LOCAL) {
    try {
      await sendFreshVerificationEmail(user);
    } catch {
      return {
        ok: false,
        message: "Your account is not verified, and the verification email could not be sent."
      };
    }

    return {
      ok: false,
      message: "Your account is not verified yet. We sent a fresh verification link."
    };
  }

  await createUserSession(user.id);
  return { ok: true, message: "" };
}

export async function resendVerificationEmail(input: {
  email: string;
}): Promise<AuthResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const rateLimit = await enforceRateLimit("resend_verification", normalizedEmail);

  if (rateLimit) {
    return rateLimit;
  }

  const user = await getUserByEmail(normalizedEmail);

  if (!user || user.emailVerifiedAt) {
    return {
      ok: true,
      message: "If that account exists and still needs verification, a fresh link has been sent."
    };
  }

  try {
    await sendFreshVerificationEmail(user);
  } catch {
    return {
      ok: false,
      message: "Could not send a fresh verification email right now."
    };
  }

  return {
    ok: true,
    message: "If that account exists and still needs verification, a fresh link has been sent."
  };
}

export async function requestPasswordReset(input: {
  email: string;
}): Promise<AuthResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const rateLimit = await enforceRateLimit("password_reset_request", normalizedEmail);

  if (rateLimit) {
    return rateLimit;
  }

  const user = await getUserByEmail(normalizedEmail);

  if (!user || !user.emailVerifiedAt) {
    return {
      ok: true,
      message: "If that account exists, a password reset link has been sent."
    };
  }

  try {
    await sendFreshPasswordResetEmail(user);
  } catch {
    return {
      ok: false,
      message: "Could not send a reset email right now."
    };
  }

  return {
    ok: true,
    message: "If that account exists, a password reset link has been sent."
  };
}

export async function verifyEmailToken(token: string): Promise<AuthResult> {
  const tokenHash = hashToken(token);
  const verificationToken = await getEmailVerificationTokenByHash(tokenHash);

  if (!verificationToken) {
    return {
      ok: false,
      message: "This verification link is invalid or already used."
    };
  }

  if (new Date(verificationToken.expiresAt).getTime() <= Date.now()) {
    await deleteEmailVerificationTokenByHash(tokenHash);
    return {
      ok: false,
      message: "This verification link has expired. Request a new one."
    };
  }

  const user = await getUserById(verificationToken.userId);

  if (!user) {
    await deleteEmailVerificationTokenByHash(tokenHash);
    return {
      ok: false,
      message: "This verification link is no longer valid."
    };
  }

  await markUserEmailVerified(user.id);
  await deleteEmailVerificationTokensByUserId(user.id);

  return {
    ok: true,
    message: "Email verified. You can sign in now."
  };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<AuthResult> {
  const rateLimit = await enforceRateLimit("password_reset_consume", input.token);

  if (rateLimit) {
    return rateLimit;
  }

  const tokenHash = hashToken(input.token);
  const resetToken = await getPasswordResetTokenByHash(tokenHash);

  if (!resetToken) {
    return {
      ok: false,
      message: "This reset link is invalid or already used."
    };
  }

  if (new Date(resetToken.expiresAt).getTime() <= Date.now()) {
    await deletePasswordResetTokenByHash(tokenHash);
    return {
      ok: false,
      message: "This reset link has expired. Request a new one."
    };
  }

  const user = await getUserById(resetToken.userId);

  if (!user) {
    await deletePasswordResetTokenByHash(tokenHash);
    return {
      ok: false,
      message: "This reset link is no longer valid."
    };
  }

  const passwordHash = await hashPassword(input.password);
  await updateUserPassword({
    userId: user.id,
    passwordHash
  });
  await deletePasswordResetTokensByUserId(user.id);
  await deleteSessionsByUserId(user.id);
  await createUserSession(user.id);

  return {
    ok: true,
    message: "Password reset complete."
  };
}

async function createUserSession(userId: string) {
  await deleteExpiredSessions();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (currentToken) {
    await deleteSessionByHash(hashToken(currentToken));
  }

  await createSession({
    userId,
    tokenHash,
    expiresAt
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt)
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    await deleteSessionByHash(hashToken(sessionToken));
  }

  cookieStore.delete(SESSION_COOKIE);
}
