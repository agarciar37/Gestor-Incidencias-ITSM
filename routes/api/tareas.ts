import { Handlers } from "$fresh/server.ts";
import { tareas, incidencias, objectId } from "../../utils/db.ts";

const BASE = Deno.env.get("BASE_URL") || "http://localhost:8000";

async function registrarLog(incidenciaId: string, accion: string) {
  await fetch(`${BASE}/api/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incidenciaId,
      usuario: "System",
      accion,
    }),
  });
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const incidenciaId = url.searchParams.get("incidenciaId");

    if (!incidenciaId) {
      return new Response(JSON.stringify([]));
    }

    const lista = await tareas
      .find({ incidenciaId: objectId(incidenciaId) })
      .toArray();

    return new Response(JSON.stringify(lista), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    const { incidenciaId, titulo, descripcion } = await req.json();

    const nueva = {
      incidenciaId: objectId(incidenciaId),
      titulo,
      descripcion,
      completada: false,
      fecha_creacion: new Date(),
    };

    await tareas.insertOne(nueva);

    await registrarLog(incidenciaId, `Tarea creada: ${titulo}`);

    await incidencias.updateOne(
      { _id: objectId(incidenciaId) },
      { $set: { estado: "en curso" } },
    );

    await registrarLog(incidenciaId, `Estado cambiado a 'en curso'`);

    return new Response(JSON.stringify({ ok: true }));
  },

  async PUT(req) {
    const { tareaId, completada } = await req.json();

    const tarea = await tareas.findOne({ _id: objectId(tareaId) });

    if (!tarea) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
        status: 404,
      });
    }

    await tareas.updateOne(
      { _id: objectId(tareaId) },
      {
        $set: {
          completada,
          fecha_completada: completada ? new Date() : undefined,
        },
      },
    );

    const incidenciaId = tarea.incidenciaId;

    await registrarLog(
      incidenciaId,
      completada
        ? `Tarea completada: ${tarea.titulo}`
        : `Tarea marcada pendiente: ${tarea.titulo}`
    );

    const total = await tareas.countDocuments({
      incidenciaId: objectId(tarea.incidenciaId),
    });
    const hechas = await tareas.countDocuments({
      incidenciaId: objectId(tarea.incidenciaId),
      completada: true,
    });

    let nuevoEstado = "en curso";
    if (total > 0 && total === hechas) nuevoEstado = "cerrada";

    await incidencias.updateOne(
      { _id: objectId(tarea.incidenciaId) },
      {
        $set: {
          estado: nuevoEstado,
          ...(nuevoEstado === "cerrada" ? { fecha_cierre: new Date() } : {}),
        },
      },
    );

    await registrarLog(incidenciaId, `Estado cambiado a '${nuevoEstado}'`);

    return new Response(JSON.stringify({ ok: true }));
  },
};
