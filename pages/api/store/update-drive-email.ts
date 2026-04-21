import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId, driveEmail } = req.body;

    if (!storeId || !driveEmail) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(driveEmail)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Actualizar email en Firebase
    await db.collection('clients').doc(storeId).update({
      driveEmail: driveEmail,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating drive email:', error);
    res.status(500).json({ error: 'Error al actualizar email de Drive' });
  }
}
