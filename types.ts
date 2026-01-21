export interface Incidencia {
  _id?: { $oid: string };
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierta" | "en curso" | "cerrada";
  tecnico?: string;
  fecha_creacion: Date;
  fecha_cierre?: Date | null;
}

export interface Dashboard {
  total: number;
  abiertas: number;
  enCurso: number;
  cerradas: number;
}

export interface Tarea {
  _id?: { $oid: string } | string;
  incidenciaId: string;       
  titulo: string;             
  descripcion?: string;       
  completada: boolean;        
  fecha_creacion: Date;       
  fecha_completada?: Date;    
}

export interface TareaIncidencia {
  _id?: { $oid: string };
  incidenciaId: string;
  titulo: string;
  descripcion?: string;
  completado: boolean;
  fecha_creacion: Date;
  fecha_completado?: Date | null;
}