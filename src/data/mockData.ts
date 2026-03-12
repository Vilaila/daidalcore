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
  fecha: string;
}

export interface EventoEconomico {
  id: string;
  nombre: string;
  descripcion: string;
  observaciones: string;
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
  eventosEconomicos: string[];
  proformaPdf: string;
  geaPdf: string;
  facturaPdf: string;
  estadoPedido: "Pendiente de correo" | "Proforma" | "Solicitud empezada" | "Factura" | "Terminado";
  estadoEnvio: "Pendiente" | "Enviado" | "En tránsito" | "Recibido";
  fechaRealizacion: string;
  observaciones: string;
}

export interface ArticuloInventario {
  id: string;
  nombre: string;
  descripcion: string;
  unidades: number;
  ubicacion: string;
  responsable: string;
  estado: "Nuevo" | "Funciona" | "Averiado" | "Roto";
  foto: string;
  presupuestoId: string;
  seccion: "E-Software" | "E-Hardware" | "Diseño" | "RRPP-Marketing" | "RRPP-Corporativa";
  enlaceWeb: string;
  observaciones: string;
  fecha: string;
}

export type RelacionUPV =
  | "No alta – Extranjero"
  | "No alta – Europa"
  | "No alta – España"
  | "Alta – Extranjero"
  | "Alta – Europa"
  | "Alta – España"
  | "Acuerdo Marco";

export type SeccionDaidalonic = "E-Software" | "E-Hardware" | "Diseño" | "RRPP-Marketing" | "RRPP-Corporativa";

export interface Empresa {
  id: string;
  nombre: string;
  descripcion: string;
  seccion: SeccionDaidalonic;
  cif: string;
  contacto: string;
  email: string;
  telefono: string;
  web: string;
  relacionUPV: RelacionUPV;
  facturar: "Factura" | "FACE";
  valoracion: number | null; // null = "aún no", 0-5 stars
  formaPago: string;
  observaciones: string;
  documentacion: string;
  fecha: string;
}

export interface Colaborador {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: "Universidad" | "Empresa" | "Particular";
  estadoRelacion: "Activo" | "Inactivo" | "Pendiente";
  correo: string;
  telefono: string;
  condiciones: string;
  observaciones: string;
  documentacion: string;
  fechaInicio: string;
}

export type RolMiembro = "Presidente" | "Coordinador de Sección" | "Coordinador de Proyecto" | "Miembro";
export type TipoIdentificacion = "DNI/NIF" | "NIE" | "PASS";

export interface Miembro {
  id: string;
  nombre: string;
  apellidos: string;
  seccion: SeccionDaidalonic;
  rol: RolMiembro;
  estatus: "Activo" | "Alumni" | "Baja";
  titulacion: string;
  centro: string;
  anioUniversitario: number;
  telefono: string;
  correoUPV: string;
  correoPersonal: string;
  cumpleanos: string;
  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;
  fechaEntrada: string;
  fechaSalida: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────

export const presupuestos: Presupuesto[] = [
  { id: "p1", nombre: "Filamento PLA", descripcion: "Bobinas PLA para impresión 3D", seccion: "Fabricación", empresa: "PrintMat SL", referencia: "REF-001", enlace: "https://printmat.es/pla", unidades: 20, precioUnitario: 18.5, prioridad: "Alta", estado: "Aprobado", eventoEconomico: "e1", fecha: "2025-01-20" },
  { id: "p2", nombre: "Sensores EMG", descripcion: "Sensores electromiográficos", seccion: "Electrónica", empresa: "SensorTech", referencia: "REF-002", enlace: "https://sensortech.com/emg", unidades: 5, precioUnitario: 45.0, prioridad: "Alta", estado: "Pendiente", eventoEconomico: "e1", fecha: "2025-02-10" },
  { id: "p3", nombre: "Servomotores MG996R", descripcion: "Servos para articulaciones", seccion: "Mecánica", empresa: "RoboComponents", referencia: "REF-003", enlace: "https://robocomp.com/servo", unidades: 12, precioUnitario: 8.75, prioridad: "Media", estado: "Aprobado", eventoEconomico: "e2", fecha: "2025-03-05" },
  { id: "p4", nombre: "Placas Arduino Nano", descripcion: "Microcontroladores", seccion: "Electrónica", empresa: "ElectroParts", referencia: "REF-004", enlace: "https://electroparts.es", unidades: 8, precioUnitario: 12.0, prioridad: "Baja", estado: "Pendiente", eventoEconomico: "e2", fecha: "2025-03-12" },
  { id: "p5", nombre: "Tornillería M3", descripcion: "Kit tornillos acero inox", seccion: "Mecánica", empresa: "FixAll", referencia: "REF-005", enlace: "", unidades: 100, precioUnitario: 0.15, prioridad: "Baja", estado: "Aprobado", eventoEconomico: "e1", fecha: "2025-01-25" },
  { id: "p6", nombre: "TPU Flexible", descripcion: "Filamento flexible para carcasas", seccion: "Fabricación", empresa: "PrintMat SL", referencia: "REF-006", enlace: "https://printmat.es/tpu", unidades: 10, precioUnitario: 25.0, prioridad: "Media", estado: "Rechazado", eventoEconomico: "e3", fecha: "2025-04-01" },
];

export const eventosEconomicos: EventoEconomico[] = [
  { id: "e1", nombre: "Subvención GE 2025", descripcion: "Subvención anual del Generitat para proyectos de robótica universitaria", observaciones: "Requiere justificación de gastos trimestral. No se permiten compras de material fungible por encima de 500€ sin aprobación previa.", colaborador: "UPV", fechaInicio: "2025-01-15", fechaFin: "2025-12-31", estado: "En progreso", presupuestoDisponible: 3500 },
  { id: "e2", nombre: "Patrocinio TechCorp", descripcion: "Acuerdo de patrocinio con TechCorp Industries para el curso 2025", observaciones: "Logo obligatorio en camisetas y cartel del stand. Entrega de informe final en septiembre.", colaborador: "TechCorp Industries", fechaInicio: "2025-03-01", fechaFin: "2025-09-30", estado: "En progreso", presupuestoDisponible: 1200 },
  { id: "e3", nombre: "Feria Maker 2025", descripcion: "Participación en la Feria Maker Valencia con stand y talleres", observaciones: "Reservar stand antes del 15 de mayo. Llevar material de demostración funcional.", colaborador: "Ayuntamiento Valencia", fechaInicio: "2025-06-01", fechaFin: "2025-06-15", estado: "Sin comenzar", presupuestoDisponible: 800 },
];

export const pedidos: Pedido[] = [
  { id: "o1", empresa: "PrintMat SL", tipoCompra: "GEA", precioTotal: 370, presupuestosIds: ["p1"], eventosEconomicos: ["e1"], proformaPdf: "", geaPdf: "", facturaPdf: "", estadoPedido: "Solicitud empezada", estadoEnvio: "Pendiente", fechaRealizacion: "2025-02-01", observaciones: "Confirmar dirección de envío con secretaría" },
  { id: "o2", empresa: "SensorTech", tipoCompra: "Adelantado", precioTotal: 225, presupuestosIds: ["p2"], eventosEconomicos: ["e1"], proformaPdf: "https://drive.google.com/proforma-o2", geaPdf: "", facturaPdf: "", estadoPedido: "Proforma", estadoEnvio: "Pendiente", fechaRealizacion: "2025-02-15", observaciones: "Pedido urgente, priorizar envío express" },
  { id: "o3", empresa: "RoboComponents", tipoCompra: "A terceros", precioTotal: 105, presupuestosIds: ["p3"], eventosEconomicos: ["e2"], proformaPdf: "https://drive.google.com/proforma-o3", geaPdf: "https://drive.google.com/gea-o3", facturaPdf: "https://drive.google.com/factura-o3", estadoPedido: "Terminado", estadoEnvio: "Recibido", fechaRealizacion: "2025-03-10", observaciones: "" },
];

export const inventario: ArticuloInventario[] = [
  { id: "i1", nombre: "Bobina PLA Blanco", descripcion: "Filamento PLA 1.75mm blanco para impresora 3D Ender 3", unidades: 15, ubicacion: "Armario 1 / Cajón 2", responsable: "Ana García", estado: "Nuevo", foto: "", presupuestoId: "p1", seccion: "E-Hardware", enlaceWeb: "https://daidalonic.com/inventario/pla-blanco", observaciones: "Almacenar en lugar seco", fecha: "2025-02-05" },
  { id: "i2", nombre: "Sensor EMG v2", descripcion: "Sensor electromiográfico de superficie para lectura muscular", unidades: 3, ubicacion: "Armario 2 / Cajón 1", responsable: "Carlos López", estado: "Funciona", foto: "", presupuestoId: "p2", seccion: "E-Hardware", enlaceWeb: "", observaciones: "Calibrar antes de cada uso", fecha: "2025-02-20" },
  { id: "i3", nombre: "Servo MG996R", descripcion: "Servomotor de alto torque para articulaciones robóticas", unidades: 10, ubicacion: "Armario 1 / Cajón 4", responsable: "María Ruiz", estado: "Funciona", foto: "", presupuestoId: "p3", seccion: "E-Hardware", enlaceWeb: "https://daidalonic.com/inventario/servo-mg996r", observaciones: "", fecha: "2025-03-15" },
  { id: "i4", nombre: "Arduino Nano Clone", descripcion: "Placa microcontroladora compatible con Arduino Nano v3", unidades: 2, ubicacion: "Armario 2 / Cajón 3", responsable: "Pedro Sánchez", estado: "Averiado", foto: "", presupuestoId: "p4", seccion: "E-Software", enlaceWeb: "", observaciones: "Puerto USB dañado en una unidad", fecha: "2025-03-20" },
];

export const empresas: Empresa[] = [
  { id: "emp1", nombre: "PrintMat SL", descripcion: "Venta de filamentos y materiales para impresión 3D profesional", seccion: "E-Hardware", cif: "B12345678", contacto: "Juan Martín", email: "info@printmat.es", telefono: "+34 961 234 567", web: "https://printmat.es", relacionUPV: "Alta – España", facturar: "Factura", valoracion: 4, formaPago: "Transferencia", observaciones: "Envíos rápidos, buen servicio postventa", documentacion: "https://daidalonic.com/docs/printmat", fecha: "2024-09-15" },
  { id: "emp2", nombre: "SensorTech", descripcion: "Componentes electrónicos y sensores biomédicos especializados", seccion: "E-Hardware", cif: "A87654321", contacto: "Lisa Chen", email: "sales@sensortech.com", telefono: "+1 555 0123", web: "https://sensortech.com", relacionUPV: "No alta – Extranjero", facturar: "Factura", valoracion: 5, formaPago: "Tarjeta", observaciones: "Requiere pedido mínimo de 100€", documentacion: "", fecha: "2024-10-01" },
  { id: "emp3", nombre: "RoboComponents", descripcion: "Distribución de motores, servos y componentes mecánicos para robótica", seccion: "E-Hardware", cif: "B11223344", contacto: "Mark Weber", email: "orders@robocomp.com", telefono: "+49 30 1234567", web: "https://robocomp.com", relacionUPV: "No alta – Europa", facturar: "Factura", valoracion: 3, formaPago: "PayPal", observaciones: "A veces tarda en responder emails", documentacion: "https://daidalonic.com/docs/robocomp", fecha: "2024-11-20" },
  { id: "emp4", nombre: "ElectroParts", descripcion: "Tienda de microcontroladores, PCBs y componentes electrónicos", seccion: "E-Software", cif: "A99887766", contacto: "Elena Torres", email: "ventas@electroparts.es", telefono: "+34 963 456 789", web: "https://electroparts.es", relacionUPV: "Alta – España", facturar: "FACE", valoracion: null, formaPago: "Transferencia", observaciones: "Descuento universitario disponible previa solicitud", documentacion: "", fecha: "2025-01-10" },
  { id: "emp5", nombre: "FixAll", descripcion: "Tornillería industrial, fijaciones y ferretería especializada", seccion: "E-Hardware", cif: "B55443322", contacto: "Roberto Díaz", email: "pedidos@fixall.es", telefono: "+34 960 111 222", web: "https://fixall.es", relacionUPV: "No alta – España", facturar: "Factura", valoracion: null, formaPago: "Contra reembolso", observaciones: "", documentacion: "", fecha: "2025-02-01" },
];

export const colaboradores: Colaborador[] = [
  { id: "c1", nombre: "UPV", descripcion: "Universidad Politécnica de Valencia, soporte institucional y cesión de espacios", tipo: "Universidad", estadoRelacion: "Activo", correo: "colaboraciones@upv.es", telefono: "+34 963 877 000", condiciones: "Uso del logo UPV obligatorio en material de difusión. Informe semestral de actividades requerido.", observaciones: "Relación consolidada desde 2022. Contactar con Dpto. de Innovación para renovaciones.", documentacion: "https://daidalonic.com/docs/upv-convenio", fechaInicio: "2022-09-01" },
  { id: "c2", nombre: "TechCorp Industries", descripcion: "Empresa tecnológica multinacional que patrocina proyectos de robótica universitaria", tipo: "Empresa", estadoRelacion: "Activo", correo: "sponsorship@techcorp.com", telefono: "+34 910 555 666", condiciones: "Logo en camisetas, stand y web. Entrega de informe final en septiembre. Mínimo 3 publicaciones en RRSS mencionando a TechCorp.", observaciones: "Renovación anual en enero. Contacto directo: Laura Gómez (Dpto. RSC).", documentacion: "https://daidalonic.com/docs/techcorp-patrocinio", fechaInicio: "2024-03-01" },
  { id: "c3", nombre: "Ayuntamiento Valencia", descripcion: "Colaboración institucional para participación en ferias y eventos municipales", tipo: "Particular", estadoRelacion: "Pendiente", correo: "cultura@valencia.es", telefono: "+34 963 525 478", condiciones: "Participación en al menos 2 eventos municipales al año. Material de stand propio.", observaciones: "Pendiente de firma del convenio 2025. Contactar con concejalía de Innovación.", documentacion: "", fechaInicio: "2025-01-15" },
];

export const miembros: Miembro[] = [
  { id: "m1", nombre: "Ana", apellidos: "García Martínez", seccion: "E-Hardware", rol: "Presidente", estatus: "Activo", titulacion: "Ing. Biomédica", centro: "ETSII", anioUniversitario: 4, telefono: "+34 612 345 678", correoUPV: "angarma@upv.edu.es", correoPersonal: "ana.garcia@gmail.com", cumpleanos: "1999-04-12", tipoIdentificacion: "DNI/NIF", numeroIdentificacion: "12345678A", fechaEntrada: "2023-09-01", fechaSalida: "" },
  { id: "m2", nombre: "Carlos", apellidos: "López Fernández", seccion: "E-Hardware", rol: "Coordinador de Sección", estatus: "Activo", titulacion: "Ing. Electrónica", centro: "ETSIT", anioUniversitario: 3, telefono: "+34 623 456 789", correoUPV: "carlofe@upv.edu.es", correoPersonal: "carlos.lopezf@gmail.com", cumpleanos: "2000-08-25", tipoIdentificacion: "DNI/NIF", numeroIdentificacion: "23456789B", fechaEntrada: "2024-01-15", fechaSalida: "" },
  { id: "m3", nombre: "María", apellidos: "Ruiz Sánchez", seccion: "Diseño", rol: "Miembro", estatus: "Alumni", titulacion: "Ing. Mecánica", centro: "ETSII", anioUniversitario: 5, telefono: "+34 634 567 890", correoUPV: "marursa@upv.edu.es", correoPersonal: "maria.ruiz@outlook.com", cumpleanos: "1998-11-03", tipoIdentificacion: "DNI/NIF", numeroIdentificacion: "34567890C", fechaEntrada: "2022-02-01", fechaSalida: "2024-06-30" },
  { id: "m4", nombre: "Pedro", apellidos: "Sánchez Díaz", seccion: "E-Software", rol: "Miembro", estatus: "Activo", titulacion: "Ing. Informática", centro: "ETSINF", anioUniversitario: 2, telefono: "+34 645 678 901", correoUPV: "pedsadi@upv.edu.es", correoPersonal: "pedro.sanchez@gmail.com", cumpleanos: "2001-01-20", tipoIdentificacion: "NIE", numeroIdentificacion: "X1234567A", fechaEntrada: "2024-09-01", fechaSalida: "" },
  { id: "m5", nombre: "Laura", apellidos: "Gómez Ruiz", seccion: "RRPP-Marketing", rol: "Coordinador de Proyecto", estatus: "Activo", titulacion: "Comunicación Audiovisual", centro: "EPSG", anioUniversitario: 3, telefono: "+34 656 789 012", correoUPV: "laugoru@upv.edu.es", correoPersonal: "laura.gomez@gmail.com", cumpleanos: "2001-06-15", tipoIdentificacion: "DNI/NIF", numeroIdentificacion: "45678901D", fechaEntrada: "2024-09-15", fechaSalida: "" },
];

// Helper
export const getSecciones = () => [...new Set(presupuestos.map(p => p.seccion))];
export const getPresupuestoTotal = (ids: string[]) => presupuestos.filter(p => ids.includes(p.id)).reduce((sum, p) => sum + p.unidades * p.precioUnitario, 0);
