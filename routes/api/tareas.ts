import { Handlers } from "$fresh/server.ts";
import { tareas, incidencias } from "../../utils/db.ts";
import { ObjectId } from "npm:mongodb";

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
      .find({ incidenciaId: new ObjectId(incidenciaId) })
      .toArray();

    const normalizadas = lista.map((t) => ({
      ...t,
      _id: t._id.toString(),
    }));

    return new Response(JSON.stringify(normalizadas), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    const { incidenciaId, titulo, descripcion } = await req.json();

    const nueva = {
      incidenciaId: new ObjectId(incidenciaId),
      titulo,
      descripcion,
      completada: false,
      fecha_creacion: new Date(),
    };

    await tareas.insertOne(nueva);

    await registrarLog(incidenciaId, `Tarea creada: ${titulo}`);

    await incidencias.updateOne(
      { _id: new ObjectId(incidenciaId) },
      { $set: { estado: "en curso" } },
    );

    await registrarLog(incidenciaId, `Estado cambiado a 'en curso'`);

    return new Response(JSON.stringify({ ok: true }));
  },

  async PUT(req) {
    const { tareaId, completada } = await req.json();

    const tarea = await tareas.findOne({ _id: new ObjectId(tareaId) });

    if (!tarea) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
        status: 404,
      });
    }

    await tareas.updateOne(
      { _id: new ObjectId(tareaId) },
      {
        $set: {
          completada,
          fecha_completada: completada ? new Date() : undefined,
        },
      },
    );

    const incidenciaId = tarea.incidenciaId.toString();

    await registrarLog(
      incidenciaId,
      completada
        ? `Tarea completada: ${tarea.titulo}`
        : `Tarea marcada pendiente: ${tarea.titulo}`
    );

    const total = await tareas.countDocuments({ incidenciaId: tarea.incidenciaId });
    const hechas = await tareas.countDocuments({
      incidenciaId: tarea.incidenciaId,
      completada: true,
    });

    let nuevoEstado = "en curso";
    if (total > 0 && total === hechas) nuevoEstado = "cerrada";

    await incidencias.updateOne(
      { _id: tarea.incidenciaId },
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
