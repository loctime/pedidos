import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminPass) {
    return res.status(500).json({ error: 'El servidor no está configurado correctamente.' });
  }

  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const session = await getIronSession(req, res, sessionOptions);
  session.isLoggedIn = true;
  session.isAdmin = true;
  session.username = adminUser;
  await session.save();

  return res.json({ ok: true });
}
