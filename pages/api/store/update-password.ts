import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId, newPassword } = req.body;

    if (!storeId || !newPassword) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Actualizar contraseña en Firebase
    await db.collection('clients').doc(storeId).update({
      password: newPassword,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
}
