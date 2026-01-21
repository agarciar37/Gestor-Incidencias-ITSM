// routes/api/incidencias.ts
import { Handlers } from "$fresh/server.ts";
import { ObjectId } from "npm:mongodb@6.20.0";
import { getCollections } from "../../utils/db.ts";
import { Incidencia } from "../../types.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { incidencias } = await getCollections();
      const body: Incidencia = await req.json();

      if (!body.titulo || !body.descripcion || !body.prioridad) {
        return new Response(
          JSON.stringify({ error: "Faltan campos obligatorios" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      body.fecha_creacion = new Date();
      body.estado = "abierta";

      if (body.prioridad === "alta") {
        body.tecnico = "Técnico principal";
      }

      const { _id, ...doc } = body as any;
      await incidencias.insertOne(doc as any);

      return new Response(
        JSON.stringify({ message: "Incidencia creada correctamente" }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error al crear incidencia:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },

  async GET() {
    try {
      const { incidencias } = await getCollections();
      const data = await incidencias.find({}).toArray();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error al listar incidencias:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },

  async PUT(req) {
    try {
      const { incidencias } = await getCollections();
      const { id, estado } = await req.json();

      const estadosPermitidos: Incidencia["estado"][] = [
        "abierta",
        "en curso",
        "cerrada",
      ];

      if (!id || !estado || !estadosPermitidos.includes(estado)) {
        return new Response(
          JSON.stringify({ error: "Faltan campos 'id' o estado inválido" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const updateData: any = { estado };
      const unsetData: Record<string, ""> = {};

      if (estado === "cerrada") {
        updateData.fecha_cierre = new Date();
      } else {
        unsetData.fecha_cierre = "";
      }

      const { matchedCount } = await incidencias.updateOne(
        { _id: new ObjectId(id) },
        {
          ...(Object.keys(updateData).length ? { $set: updateData } : {}),
          ...(Object.keys(unsetData).length ? { $unset: unsetData } : {}),
        },
      );

      if (!matchedCount) {
        return new Response(
          JSON.stringify({ error: "Incidencia no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ message: "Incidencia actualizada correctamente" }),
        { headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error al actualizar incidencia:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
};
