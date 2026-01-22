import { tareas, incidencias, objectId } from "./db.ts";
import { Incidencia, TareaIncidencia } from "../types.ts";

export async function recalcularEstadoIncidencia(
  incidenciaId: string,
): Promise<Incidencia["estado"]> {
  const listaTareas = await tareas
    .find({ incidenciaId: objectId(incidenciaId) })
    .toArray() as TareaIncidencia[];

  let nuevoEstado: Incidencia["estado"] = "abierta";

  if (listaTareas.length === 0) {
    nuevoEstado = "abierta";
  } else {
    const hechas = listaTareas.filter((t) => t.completado).length;
    if (hechas === 0) {
      nuevoEstado = "abierta";
    } else if (hechas < listaTareas.length) {
      nuevoEstado = "en curso";
    } else {
      nuevoEstado = "cerrada";
    }
  }

  const update: any = { estado: nuevoEstado };
  if (nuevoEstado === "cerrada") {
    update.fecha_cierre = new Date();
  } else {
    update.fecha_cierre = null;
  }

  await incidencias.updateOne(
    { _id: objectId(incidenciaId) },
    { $set: update },
  );

  return nuevoEstado;
}
