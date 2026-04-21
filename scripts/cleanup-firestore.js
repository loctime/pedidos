const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin con service account
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey-controlfile.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function cleanupFirestore() {
  try {
    console.log('🧹 Limpiando documentos existentes...\n');

    // Eliminar documentos de /clients
    console.log('🗑️  Eliminando documentos de /clients...');
    const clientsSnapshot = await db.collection('clients').get();
    
    if (clientsSnapshot.empty) {
      console.log('  ✅ No hay documentos que eliminar en /clients');
    } else {
      const batch = db.batch();
      clientsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        console.log(`    - Eliminando: ${doc.id}`);
      });
      
      await batch.commit();
      console.log(`  ✅ Eliminados ${clientsSnapshot.size} documentos de /clients`);
    }

    // Eliminar toda la colección /apps/pedidos si existe
    console.log('\n🗑️  Eliminando /apps/pedidos...');
    const pedidosDoc = await db.collection('apps').doc('pedidos').get();
    
    if (pedidosDoc.exists) {
      // Eliminar todas las subcolecciones
      const collections = await db.collection('apps').doc('pedidos').listCollections();
      
      for (const collection of collections) {
        const snapshot = await collection.get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          console.log(`    - Eliminando de ${collection.path}: ${doc.id}`);
        });
        await batch.commit();
        console.log(`  ✅ Eliminados ${snapshot.size} documentos de ${collection.path}`);
      }
      
      // Eliminar el documento principal
      await db.collection('apps').doc('pedidos').delete();
      console.log('  ✅ Eliminado documento /apps/pedidos');
    } else {
      console.log('  ✅ No existe /apps/pedidos');
    }

    console.log('\n🎉 Limpieza completada!');

  } catch (error) {
    console.error('❌ Error al limpiar Firestore:', error);
  } finally {
    process.exit(0);
  }
}

// Preguntar confirmación
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️  ESTÁS A PUNTO DE ELIMINAR DATOS DE FIRESTORE. ¿Estás seguro? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    cleanupFirestore();
  } else {
    console.log('❌ Operación cancelada');
    process.exit(0);
  }
  rl.close();
});
