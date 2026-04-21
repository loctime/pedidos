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

async function checkExistingData() {
  try {
    console.log('🔍 Revisando documentos existentes...\n');

    // Revisar colección clients (raíz)
    console.log('📁 Colección: clients');
    const clientsSnapshot = await db.collection('clients').get();
    
    if (clientsSnapshot.empty) {
      console.log('  ✅ No hay documentos en /clients');
    } else {
      console.log(`  ⚠️  Encontrados ${clientsSnapshot.size} documentos en /clients:`);
      clientsSnapshot.docs.forEach(doc => {
        console.log(`    - ID: ${doc.id}`);
        console.log(`      Datos: ${JSON.stringify(doc.data(), null, 6)}`);
      });
    }

    // Revisar si ya existe /apps/pedidos/users
    console.log('\n📁 Colección: /apps/pedidos/users');
    const usersSnapshot = await db.collection('apps').doc('pedidos').collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('  ✅ No hay documentos en /apps/pedidos/users');
    } else {
      console.log(`  ⚠️  Encontrados ${usersSnapshot.size} documentos en /apps/pedidos/users:`);
      usersSnapshot.docs.forEach(doc => {
        console.log(`    - ID: ${doc.id}`);
        console.log(`      Datos: ${JSON.stringify(doc.data(), null, 6)}`);
      });
    }

    // Revisar toda la colección apps
    console.log('\n📁 Colección: /apps');
    const appsSnapshot = await db.collection('apps').get();
    
    if (appsSnapshot.empty) {
      console.log('  ✅ No hay documentos en /apps');
    } else {
      console.log(`  ⚠️  Encontrados ${appsSnapshot.size} documentos en /apps:`);
      appsSnapshot.docs.forEach(doc => {
        console.log(`    - ID: ${doc.id}`);
        console.log(`      Datos: ${JSON.stringify(doc.data(), null, 6)}`);
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar Firestore:', error);
  } finally {
    process.exit(0);
  }
}

checkExistingData();
