/** Tipos de la sección Mi Dinero (portafolio y metas). */

/** Una posición del portafolio con P&L calculado por el backend. */
export interface Posicion {
  id: number;
  activo: string;
  cantidad: number;
  precioCompra: number;
  precioActual: number;
  valorActual: number;
  ganancia: number;
  gananciaPct: number;
  fecha: string;
  /** true si cayó 10% o más desde el precio de compra (stop-loss). */
  alerta: boolean;
}

/** Una meta de ahorro. */
export interface MetaAhorro {
  id: number;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaLimite: string;
}

/** Activos que se pueden cargar al portafolio. */
export const ACTIVOS_PORTFOLIO = ['YPF', 'GGAL', 'AAPL', 'MSFT', 'SPY', 'Bitcoin', 'Ethereum'];

/** Categorías de gastos del mes. */
export const CATEGORIAS_GASTO = ['Comida', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Otros'];

/** Un gasto del mes. */
export interface Gasto {
  id: number;
  categoria: string;
  descripcion: string | null;
  monto: number;
  fecha: string;
}

/** Resumen del mes: total, sobra, categorías y metas. */
export interface ResumenGastos {
  total: number;
  ingreso: number;
  tieneIngreso?: boolean;
  sobra?: number | null;
  porCategoria: Record<string, number>;
  metasMensuales: { nombre: string; faltante: number; porMes: number }[];
}
