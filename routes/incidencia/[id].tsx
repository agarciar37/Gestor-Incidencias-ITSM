// routes/incidencia/[id].tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { ObjectId } from "npm:mongodb@6.20.0";
import { getCollections } from "../../utils/db.ts";
import TareasIncidencia from "../../islands/TareasIncidencia.tsx";
import AuditLog from "../../islands/AuditLog.tsx";
import { Incidencia } from "../../types.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { id } = ctx.params;

    if (!ObjectId.isValid(id)) {
      console.warn("⚠️ ID inválido recibido:", id);
      return ctx.renderNotFound();
    }

    const { incidencias } = await getCollections();
    const incidencia = await incidencias.findOne({ _id: new ObjectId(id) }) as any;

    if (!incidencia) return ctx.renderNotFound();

    return ctx.render({ incidencia, id });
  },
};

export default function IncidenciaPage(
  { data }: PageProps<{ incidencia: Incidencia; id: string }>,
) {
  const { incidencia, id } = data;

  return (
    <div class="sn-container">
      <header class="sn-header sn-header-detail">
        <h1 class="sn-title">
          INC{(incidencia as any)._id?.toString().slice(-6)} — {incidencia.titulo}
        </h1>
        <p class={`sn-badge sn-${incidencia.estado.replace(" ", "")}`}>
          {incidencia.estado.toUpperCase()}
        </p>
      </header>

      <section class="sn-card">
        <h2 class="sn-section-title">Detalles de la incidencia</h2>

        <div class="sn-detail-grid">
          <div>
            <label class="sn-label">Título</label>
            <p class="sn-value">{incidencia.titulo}</p>
          </div>

          <div>
            <label class="sn-label">Estado</label>
            <p class="sn-value">{incidencia.estado}</p>
          </div>

          <div>
            <label class="sn-label">Prioridad</label>
            <p class="sn-value">{incidencia.prioridad}</p>
          </div>

          {incidencia.tecnico && (
            <div>
              <label class="sn-label">Técnico asignado</label>
              <p class="sn-value">{incidencia.tecnico}</p>
            </div>
          )}

          <div>
            <label class="sn-label">Fecha creación</label>
            <p class="sn-value">
              {new Date(incidencia.fecha_creacion).toLocaleString()}
            </p>
          </div>

          {incidencia.fecha_cierre && (
            <div>
              <label class="sn-label">Fecha cierre</label>
              <p class="sn-value">
                {new Date(incidencia.fecha_cierre).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div class="sn-description-box">
          <label class="sn-label">Descripción</label>
          <p class="sn-description">{incidencia.descripcion}</p>
        </div>
      </section>

      <section class="sn-card">
        <TareasIncidencia incidenciaId={id} />
      </section>

      <section class="sn-card">
        <AuditLog incidenciaId={id} />
      </section>
    </div>
  );
}
