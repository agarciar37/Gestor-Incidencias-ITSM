// utils/estadoIncidencia.ts
import { ObjectId } from "npm:mongodb@6.20.0";
import { getCollections } from "./db.ts";
import type { Incidencia, TareaIncidencia } from "../types.ts";

export async function recalcularEstadoIncidencia(
  incidenciaId: string,
): Promise<Incidencia["estado"]> {
  const { tareas, incidencias } = await getCollections();

  const incObjId = new ObjectId(incidenciaId);

  const listaTareas = await tareas
    .find<TareaIncidencia>({ incidenciaId: incObjId })
    .toArray();

  let nuevoEstado: Incidencia["estado"] = "abierta";

  if (listaTareas.length === 0) {
    nuevoEstado = "abierta";
  } else {
    const hechas = listaTareas.filter((t) => t.completada).length;
    if (hechas === 0) nuevoEstado = "abierta";
    else if (hechas < listaTareas.length) nuevoEstado = "en curso";
    else nuevoEstado = "cerrada";
  }

  const update: Record<string, unknown> = { estado: nuevoEstado };

  if (nuevoEstado === "cerrada") {
    update.fecha_cierre = new Date();
  } else {
    update.fecha_cierre = null;
  }

  await incidencias.updateOne({ _id: incObjId }, { $set: update });

  return nuevoEstado;
}
