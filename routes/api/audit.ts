import { Handlers } from "$fresh/server.ts";
import { audit_log, objectId } from "../../utils/db.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { incidenciaId, usuario, accion } = await req.json();

      if (!incidenciaId || !accion) {
        return new Response(JSON.stringify({ error: "Faltan datos" }), {
          status: 400,
        });
      }

      await audit_log.insertOne({
        incidenciaId: objectId(incidenciaId),
        usuario: usuario || "System",
        accion,
        fecha: new Date(),
      });

      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    } catch (e) {
      console.error("Error audit POST:", e);
      return new Response(JSON.stringify({ error: "Error interno" }), {
        status: 500,
      });
    }
  },

  async GET(req) {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "ID requerido" }), {
          status: 400,
        });
      }

      const logs = await audit_log
        .find({ incidenciaId: objectId(id) })
        .sort({ fecha: -1 })
        .toArray();

      return new Response(JSON.stringify(logs), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Error audit GET:", e);
      return new Response(JSON.stringify({ error: "Error interno" }), {
        status: 500,
      });
    }
  },
};
