
import axios, { AxiosError, AxiosResponse } from 'axios'; // Corregir importación

// Interface para el formato de errores de la API
interface ErrorResponse {
    message: string;
    [key: string]: any; // Permite propiedades adicionales
}

// Función de tipo guard mejorada
function isAxiosError(error: unknown): error is AxiosError<ErrorResponse> {
    return (error as AxiosError).isAxiosError === true;
}


const API_URL = 'http://localhost:5000/api';

// Interfaces para tipar las respuestas
interface CarritoResponse {
    id: number;
    clienteId: number;
    estado: string;
    total: number;
    createdAt: string;
    updatedAt: string;
    items: CarritoItemResponse[];
}

interface CarritoItemResponse {
    id: number;
    carritoId: number;
    productoId: number;
    cantidad: number;
    precio: number;
    createdAt: string;
    updatedAt: string;
}

async function verificarServidor() {
    try {
        await axios.get(`${API_URL}/health`);
        return true;
    } catch (error) {
        console.error('❌ El servidor no está respondiendo en', API_URL);
        console.error('📝 Verifica que:');
        console.error('1. El servidor esté corriendo (npm run dev)');
        console.error('2. El puerto 5000 esté disponible');
        console.error('3. La ruta /health esté configurada');
        return false;
    }
}

async function verificarDatos() {
    try {
        // Verificar que existe el cliente
        await axios.get(`${API_URL}/clientes/1`);
        // Verificar que existe el producto
        await axios.get(`${API_URL}/productos/1`);
        return true;
    } catch (error) {
        console.error('❌ Error al verificar datos necesarios');
        console.error('📝 Verifica que:');
        console.error('1. Exista un cliente con ID 1');
        console.error('2. Exista un producto con ID 1');
        return false;
    }
}

async function testCarrito() {
    try {
        console.log('🔍 Verificando servidor y datos...');
        
        const servidorOk = await verificarServidor();
        if (!servidorOk) return;
        
        const datosOk = await verificarDatos();
        if (!datosOk) return;

        console.log('🛒 Iniciando pruebas del carrito...');

        // 1. Crear un nuevo carrito
        const carritoResponse = await axios.post<CarritoResponse>(`${API_URL}/carritos`, {
            clienteId: 1
        });
        console.log('✅ Carrito creado:', carritoResponse.data);
        const carritoId = carritoResponse.data.id;

        // 2. Agregar items al carrito
        const itemResponse = await axios.post<CarritoItemResponse>(`${API_URL}/carritos/items`, {
            carritoId,
            productoId: 1,
            cantidad: 2
        });
        console.log('✅ Item agregado:', itemResponse.data);

        // 3. Obtener el carrito actualizado
        const carritoActualizado = await axios.get<CarritoResponse>(`${API_URL}/carritos/${carritoId}`);
        console.log('📦 Estado del carrito:', carritoActualizado.data);

        // 4. Actualizar cantidad de un item
        const itemId = itemResponse.data.id;
        const itemActualizado = await axios.put<CarritoItemResponse>(`${API_URL}/carritos/items/${itemId}`, {
            cantidad: 3
        });
        console.log('✏️ Item actualizado:', itemActualizado.data);

        // 5. Completar el carrito
        const carritoCompletado = await axios.post<CarritoResponse>(`${API_URL}/carritos/${carritoId}/completar`);
        console.log('🎉 Carrito completado:', carritoCompletado.data);

    } catch (error) {
        if (isAxiosError(error)) {
            console.error('❌ Error en la petición HTTP:');
            console.error('- Status:', error.response?.status);
            console.error('- Mensaje:', error.response?.data?.message || error.message);
            console.error('- URL:', error.config?.url);
            console.error('- Método:', error.config?.method?.toUpperCase());
            if (error.config?.data) {
                console.error('- Datos enviados:', error.config.data);
            }
        } else {
            console.error('❌ Error inesperado:', error instanceof Error ? error.message : String(error));
        }
    }
}

// Ejecutar las pruebas
console.log('🚀 Iniciando suite de pruebas del carrito...\n');

// Corregir el bloque catch final
testCarrito().catch((error: unknown) => {
    console.error('\n❌ Error fatal en la ejecución de las pruebas:');
    
    if (isAxiosError(error)) {
        const errorDetails = error.response?.data?.message || error.message;
        console.error('Detalles:', errorDetails);
    } else if (error instanceof Error) {
        console.error('Detalles:', error.message);
    } else {
        console.error('Detalles:', String(error));
    }
    
    process.exit(1);
});
