import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days

const fromSessionTokenToSessionId = (sessionToken: string) => {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
};

export const generateRandomSessionToken = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
};

export const createSession = async (sessionToken: string, userId: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
  };

  // TODO save it to the DB

  // await prisma.session.create({
  //    data: session,
  //  });

  return session;
};

export const validateSession = async (sessionToken: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  let result;
  // TODO fetch sessionId for user DB

  //   const result = await prisma.session.findUnique({
  //     where: {
  //       id: sessionId,
  //     },
  //     include: {
  //       user: true,
  //     },
  //   });

  if (!result) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  if (Date.now() >= session.expiresAt.getTime()) {
    // TODO delete expires session from DB
    // await prisma.session.delete({
    //     where: {
    //       id: sessionId,
    //     },
    //   });

    return { session: null, user: null };
  }

  // if 15 days are left until the session expires, refresh the session
  if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    session.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);

    // or your ORM of choice
    // await prisma.session.update({
    //   where: {
    //     id: sessionId,
    //   },
    //   data: {
    //     expiresAt: session.expiresAt,
    //   },
    // });
  }

  return { session, user };
};

export const invalidateSession = async (sessionId: string) => {
  // TODO delete session from the DB
  //   await prisma.session.delete({
  //     where: {
  //       id: sessionId,
  //     },
  //   });
};
