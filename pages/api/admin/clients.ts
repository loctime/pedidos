import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import bcrypt from 'bcryptjs';
import { sessionOptions } from '../../../lib/session';
import { db } from '../../../lib/firebase-admin';

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.isLoggedIn || !session.isAdmin) {
    res.status(401).json({ error: 'No autorizado' });
    return null;
  }
  return session;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const col = db.collection('clients');

  if (req.method === 'GET') {
    const snapshot = await col.orderBy('createdAt', 'desc').get();
    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      passwordHash: undefined,
    }));
    return res.json(clients);
  }

  if (req.method === 'POST') {
    const { username, password, storeName, sheetUrl, whatsappNumber } = req.body;
    if (!username || !password || !storeName || !sheetUrl) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const existing = await col.where('username', '==', username).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const docRef = await col.add({
      username,
      passwordHash,
      storeName,
      sheetUrl,
      whatsappNumber: whatsappNumber || '510000000000',
      createdAt: new Date(),
    });

    return res.status(201).json({ id: docRef.id, username, storeName });
  }

  if (req.method === 'PUT') {
    const { id, storeName, sheetUrl, whatsappNumber, password } = req.body;
    if (!id) return res.status(400).json({ error: 'Falta el id' });

    const updates: Record<string, unknown> = {};
    if (storeName) updates.storeName = storeName;
    if (sheetUrl) updates.sheetUrl = sheetUrl;
    if (whatsappNumber) updates.whatsappNumber = whatsappNumber;
    if (password) updates.passwordHash = await bcrypt.hash(password, 12);

    await col.doc(id).update(updates);
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Falta el id' });
    await col.doc(id).delete();
    return res.json({ ok: true });
  }

  return res.status(405).end();
}
