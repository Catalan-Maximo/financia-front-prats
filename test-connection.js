const axios = require('axios');

// Configuración del cliente API (igual a lo que usa la app)
const api = axios.create({
  baseURL: 'http://192.168.100.77:8080/api/v1',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

async function testConnection() {
  console.log('🚀 Probando conexión con Backend FinancIA...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Probando Health Check...');
    const healthResponse = await api.get('/health');
    console.log('✅ Respuesta:', healthResponse.data);
    console.log();

    // Test 2: Crear Usuario
    console.log('2️⃣  Creando usuario...');
    const usuarioResponse = await api.post('/usuarios/perfil', {
      nombre: 'Test desde Frontend',
      email: 'test@financia.com',
      perfilInversor: 'Agresivo',
    });
    console.log('✅ Usuario creado:', usuarioResponse.data);
    const userId = usuarioResponse.data.id;
    console.log();

    // Test 3: Obtener Usuario
    console.log('3️⃣  Obteniendo usuario...');
    const getResponse = await api.get(`/usuarios/${userId}`);
    console.log('✅ Usuario recuperado:', getResponse.data);
    console.log();

    // Test 4: Tasas de Inversión
    console.log('4️⃣  Obteniendo tasas de inversión...');
    const tasasResponse = await api.get('/activos/tasas');
    console.log('✅ Tasas:', tasasResponse.data);
    console.log();

    // Test 5: Simulación IA
    console.log('5️⃣  Probando simulación IA...');
    const simResponse = await api.post('/ia/simular', {
      activoA: 'Mercado Pago',
      activoB: 'Banco Nación',
    });
    console.log('✅ Simulación:', simResponse.data);
    console.log();

    console.log('🎉 ¡CONEXIÓN EXITOSA! Todos los endpoints funcionan correctamente.');
    console.log('✨ El frontend puede comunicarse sin problemas con el backend.\n');

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testConnection();
