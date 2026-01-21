// routes/api/tareas.ts
import { Handlers } from "$fresh/server.ts";
import { ObjectId } from "npm:mongodb@6.20.0";
import { getCollections } from "../../utils/db.ts";

async function registrarLog(
  incidenciaId: string,
  accion: string,
  usuario = "System",
) {
  const { audit_log } = await getCollections();

  await audit_log.insertOne({
    incidenciaId: new ObjectId(incidenciaId),
    usuario,
    accion,
    fecha: new Date(),
  });
}

export const handler: Handlers = {
  async GET(req) {
    const { tareas } = await getCollections();
    const url = new URL(req.url);
    const incidenciaId = url.searchParams.get("incidenciaId");

    if (!incidenciaId) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const lista = await tareas
      .find({ incidenciaId: new ObjectId(incidenciaId) })
      .toArray();

    const normalizadas = lista.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
      incidenciaId: t.incidenciaId.toString(),
    }));

    return new Response(JSON.stringify(normalizadas), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async POST(req) {
    const { tareas, incidencias } = await getCollections();
    const { incidenciaId, titulo, descripcion } = await req.json();

    if (!incidenciaId || !titulo) {
      return new Response(JSON.stringify({ error: "Faltan datos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const incObjId = new ObjectId(incidenciaId);

    const nueva = {
      incidenciaId: incObjId,
      titulo,
      descripcion,
      completada: false,
      fecha_creacion: new Date(),
    };

    await tareas.insertOne(nueva as any);
    await registrarLog(incidenciaId, `Tarea creada: ${titulo}`);

    // Al crear una tarea, la incidencia pasa a "en curso"
    await incidencias.updateOne(
      { _id: incObjId },
      { $set: { estado: "en curso" } },
    );
    await registrarLog(incidenciaId, `Estado cambiado a 'en curso'`);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async PUT(req) {
    const { tareas, incidencias } = await getCollections();
    const { tareaId, completada } = await req.json();

    if (!tareaId || typeof completada !== "boolean") {
      return new Response(JSON.stringify({ error: "Faltan datos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tarea = await tareas.findOne({ _id: new ObjectId(tareaId) }) as any;

    if (!tarea) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await tareas.updateOne(
      { _id: new ObjectId(tareaId) },
      {
        $set: {
          completada,
          fecha_completada: completada ? new Date() : null,
        },
      },
    );

    const incidenciaId = tarea.incidenciaId.toString();

    await registrarLog(
      incidenciaId,
      completada
        ? `Tarea completada: ${tarea.titulo}`
        : `Tarea marcada pendiente: ${tarea.titulo}`,
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
          ...(nuevoEstado === "cerrada" ? { fecha_cierre: new Date() } : { fecha_cierre: null }),
        },
      },
    );

    await registrarLog(incidenciaId, `Estado cambiado a '${nuevoEstado}'`);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
