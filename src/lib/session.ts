import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "computec_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

type SessionPayload = {
  dni: string;
  nombre: string;
  nivel: string | null;
  exp: number;
};

function getSecret(): string | null {
  const secret = process.env.APP_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

export async function createSession(input: {
  dni: string;
  nombre: string;
  nivel: string | null;
}) {
  const secret = getSecret();

  if (!secret) {
    throw new Error(
      "Falta APP_SESSION_SECRET en .env; debe tener al menos 32 caracteres."
    );
  }

  const payload: SessionPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${encoded}.${sign(encoded, secret)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const secret = getSecret();

  if (!secret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const encoded = token.slice(0, separator);
  const receivedSignature = token.slice(separator + 1);
  const expectedSignature = sign(encoded, secret);

  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      !payload.dni ||
      !payload.nombre ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}