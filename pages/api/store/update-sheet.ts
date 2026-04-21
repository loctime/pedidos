import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId, sheetUrl } = req.body;

    if (!storeId || !sheetUrl) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar que sea una URL de Google Sheets válida
    if (!sheetUrl.includes('docs.google.com/spreadsheets') || !sheetUrl.includes('output=csv')) {
      return res.status(400).json({ error: 'URL de Google Sheets inválida. Debe ser un enlace público con formato CSV.' });
    }

    // Actualizar URL en Firebase
    await db.collection('clients').doc(storeId).update({
      sheetUrl: sheetUrl,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating sheet URL:', error);
    res.status(500).json({ error: 'Error al actualizar URL del Google Sheets' });
  }
}
