export interface Presupuesto {
  id: string;
  nombre: string;
  descripcion: string;
  seccion: string;
  empresa: string;
  referencia: string;
  enlace: string;
  unidades: number;
  precioUnitario: number;
  prioridad: "Alta" | "Media" | "Baja";
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  eventoEconomico: string;
}

export interface EventoEconomico {
  id: string;
  nombre: string;
  colaborador: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "Sin comenzar" | "En progreso" | "Terminado";
  presupuestoDisponible: number;
}

export interface Pedido {
  id: string;
  empresa: string;
  tipoCompra: "GEA" | "Adelantado" | "A terceros";
  precioTotal: number;
  presupuestosIds: string[];
  proformaPdf: string;
  geaPdf: string;
  facturaPdf: string;
  estado: "Pendiente de correo" | "Proforma" | "Solicitud empezada" | "Factura" | "Terminado";
}

export interface ArticuloInventario {
  id: string;
  nombre: string;
  unidades: number;
  ubicacion: string;
  responsable: string;
  estado: "Nuevo" | "Funciona" | "Averiado" | "Roto";
  foto: string;
  presupuestoId: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  cif: string;
  contacto: string;
  email: string;
  valoracion: number;
  formaPago: string;
}

export interface Colaborador {
  id: string;
  nombre: string;
  tipo: "Universidad" | "Empresa" | "Particular";
  estadoRelacion: "Activo" | "Inactivo" | "Pendiente";
}

export interface Miembro {
  id: string;
  nombre: string;
  estatus: "Activo" | "Alumni" | "Baja";
  titulacion: string;
  centro: string;
  cumpleanos: string;
  fechaEntrada: string;
  fechaSalida: string;
}

export const presupuestos: Presupuesto[] = [
  { id: "p1", nombre: "Filamento PLA", descripcion: "Bobinas PLA para impresión 3D", seccion: "Fabricación", empresa: "PrintMat SL", referencia: "REF-001", enlace: "https://printmat.es/pla", unidades: 20, precioUnitario: 18.5, prioridad: "Alta", estado: "Aprobado", eventoEconomico: "e1" },
  { id: "p2", nombre: "Sensores EMG", descripcion: "Sensores electromiográficos", seccion: "Electrónica", empresa: "SensorTech", referencia: "REF-002", enlace: "https://sensortech.com/emg", unidades: 5, precioUnitario: 45.0, prioridad: "Alta", estado: "Pendiente", eventoEconomico: "e1" },
  { id: "p3", nombre: "Servomotores MG996R", descripcion: "Servos para articulaciones", seccion: "Mecánica", empresa: "RoboComponents", referencia: "REF-003", enlace: "https://robocomp.com/servo", unidades: 12, precioUnitario: 8.75, prioridad: "Media", estado: "Aprobado", eventoEconomico: "e2" },
  { id: "p4", nombre: "Placas Arduino Nano", descripcion: "Microcontroladores", seccion: "Electrónica", empresa: "ElectroParts", referencia: "REF-004", enlace: "https://electroparts.es", unidades: 8, precioUnitario: 12.0, prioridad: "Baja", estado: "Pendiente", eventoEconomico: "e2" },
  { id: "p5", nombre: "Tornillería M3", descripcion: "Kit tornillos acero inox", seccion: "Mecánica", empresa: "FixAll", referencia: "REF-005", enlace: "", unidades: 100, precioUnitario: 0.15, prioridad: "Baja", estado: "Aprobado", eventoEconomico: "e1" },
  { id: "p6", nombre: "TPU Flexible", descripcion: "Filamento flexible para carcasas", seccion: "Fabricación", empresa: "PrintMat SL", referencia: "REF-006", enlace: "https://printmat.es/tpu", unidades: 10, precioUnitario: 25.0, prioridad: "Media", estado: "Rechazado", eventoEconomico: "e3" },
];

export const eventosEconomicos: EventoEconomico[] = [
  { id: "e1", nombre: "Subvención GE 2025", colaborador: "UPV", fechaInicio: "2025-01-15", fechaFin: "2025-12-31", estado: "En progreso", presupuestoDisponible: 3500 },
  { id: "e2", nombre: "Patrocinio TechCorp", colaborador: "TechCorp Industries", fechaInicio: "2025-03-01", fechaFin: "2025-09-30", estado: "En progreso", presupuestoDisponible: 1200 },
  { id: "e3", nombre: "Feria Maker 2025", colaborador: "Ayuntamiento Valencia", fechaInicio: "2025-06-01", fechaFin: "2025-06-15", estado: "Sin comenzar", presupuestoDisponible: 800 },
];

export const pedidos: Pedido[] = [
  { id: "o1", empresa: "PrintMat SL", tipoCompra: "GEA", precioTotal: 370, presupuestosIds: ["p1"], proformaPdf: "", geaPdf: "", facturaPdf: "", estado: "Solicitud empezada" },
  { id: "o2", empresa: "SensorTech", tipoCompra: "Adelantado", precioTotal: 225, presupuestosIds: ["p2"], proformaPdf: "", geaPdf: "", facturaPdf: "", estado: "Proforma" },
  { id: "o3", empresa: "RoboComponents", tipoCompra: "A terceros", precioTotal: 105, presupuestosIds: ["p3"], proformaPdf: "", geaPdf: "", facturaPdf: "", estado: "Terminado" },
];

export const inventario: ArticuloInventario[] = [
  { id: "i1", nombre: "Bobina PLA Blanco", unidades: 15, ubicacion: "Armario 1 / Cajón 2", responsable: "Ana García", estado: "Nuevo", foto: "", presupuestoId: "p1" },
  { id: "i2", nombre: "Sensor EMG v2", unidades: 3, ubicacion: "Armario 2 / Cajón 1", responsable: "Carlos López", estado: "Funciona", foto: "", presupuestoId: "p2" },
  { id: "i3", nombre: "Servo MG996R", unidades: 10, ubicacion: "Armario 1 / Cajón 4", responsable: "María Ruiz", estado: "Funciona", foto: "", presupuestoId: "p3" },
  { id: "i4", nombre: "Arduino Nano Clone", unidades: 2, ubicacion: "Armario 2 / Cajón 3", responsable: "Pedro Sánchez", estado: "Averiado", foto: "", presupuestoId: "p4" },
];

export const empresas: Empresa[] = [
  { id: "emp1", nombre: "PrintMat SL", cif: "B12345678", contacto: "Juan Martín", email: "info@printmat.es", valoracion: 9, formaPago: "Transferencia" },
  { id: "emp2", nombre: "SensorTech", cif: "A87654321", contacto: "Lisa Chen", email: "sales@sensortech.com", valoracion: 8, formaPago: "Tarjeta" },
  { id: "emp3", nombre: "RoboComponents", cif: "B11223344", contacto: "Mark Weber", email: "orders@robocomp.com", valoracion: 7, formaPago: "PayPal" },
  { id: "emp4", nombre: "ElectroParts", cif: "A99887766", contacto: "Elena Torres", email: "ventas@electroparts.es", valoracion: 6, formaPago: "Transferencia" },
  { id: "emp5", nombre: "FixAll", cif: "B55443322", contacto: "Roberto Díaz", email: "pedidos@fixall.es", valoracion: 8, formaPago: "Contra reembolso" },
];

export const colaboradores: Colaborador[] = [
  { id: "c1", nombre: "UPV", tipo: "Universidad", estadoRelacion: "Activo" },
  { id: "c2", nombre: "TechCorp Industries", tipo: "Empresa", estadoRelacion: "Activo" },
  { id: "c3", nombre: "Ayuntamiento Valencia", tipo: "Particular", estadoRelacion: "Pendiente" },
];

export const miembros: Miembro[] = [
  { id: "m1", nombre: "Ana García", estatus: "Activo", titulacion: "Ing. Biomédica", centro: "ETSII", cumpleanos: "1999-04-12", fechaEntrada: "2023-09-01", fechaSalida: "" },
  { id: "m2", nombre: "Carlos López", estatus: "Activo", titulacion: "Ing. Electrónica", centro: "ETSIT", cumpleanos: "2000-08-25", fechaEntrada: "2024-01-15", fechaSalida: "" },
  { id: "m3", nombre: "María Ruiz", estatus: "Alumni", titulacion: "Ing. Mecánica", centro: "ETSII", cumpleanos: "1998-11-03", fechaEntrada: "2022-02-01", fechaSalida: "2024-06-30" },
  { id: "m4", nombre: "Pedro Sánchez", estatus: "Activo", titulacion: "Ing. Informática", centro: "ETSINF", cumpleanos: "2001-01-20", fechaEntrada: "2024-09-01", fechaSalida: "" },
];

// Helper
export const getSecciones = () => [...new Set(presupuestos.map(p => p.seccion))];
export const getPresupuestoTotal = (ids: string[]) => presupuestos.filter(p => ids.includes(p.id)).reduce((sum, p) => sum + p.unidades * p.precioUnitario, 0);
