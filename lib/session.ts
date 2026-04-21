import type { IronSessionOptions } from 'iron-session';

export interface SessionData {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username?: string;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'tiendita_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  },
};

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
