import { useState } from "preact/hooks";
import { Incidencia, TareaIncidencia } from "../types.ts";

interface Props {
  incidenciaId: string;
  tareasIniciales: TareaIncidencia[];
  estadoInicial: Incidencia["estado"];
}

export default function TareasIncidenciaList(
  { incidenciaId, tareasIniciales, estadoInicial }: Props,
) {
  const [tareas, setTareas] = useState<TareaIncidencia[]>(tareasIniciales);
  const [estado, setEstado] = useState<Incidencia["estado"]>(estadoInicial);
  const [mensaje, setMensaje] = useState<
    { tipo: "success" | "error"; texto: string } | null
  >(null);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);

  const toggleTarea = async (id: string, completado: boolean) => {
    try {
      setActualizandoId(id);
      setMensaje(null);

      const resp = await fetch("/api/tareas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completado }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo actualizar la tarea");
      }

      const data = await resp.json();
      const nuevoEstado = data.nuevoEstado as Incidencia["estado"];

      setTareas((prev) =>
        prev.map((t) =>
          t._id?.$oid === id
            ? {
              ...t,
              completado,
              fecha_completado: completado ? new Date() : null,
            }
            : t
        )
      );

      setEstado(nuevoEstado);

      setMensaje({
        tipo: "success",
        texto: `Tarea actualizada. Estado de la incidencia: ${nuevoEstado}`,
      });
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: error instanceof Error
          ? error.message
          : "Error desconocido al actualizar tarea",
      });
    } finally {
      setActualizandoId(null);
    }
  };

  const estadoClase =
    estado === "abierta"
      ? "state-chip state-open"
      : estado === "en curso"
      ? "state-chip state-progress"
      : "state-chip state-closed";

  return (
    <div class="task-list-container">
      <div class="task-list-header">
        <span class="task-list-title">Progreso de la incidencia</span>
        <span class={estadoClase}>{estado.toUpperCase()}</span>
      </div>

      {mensaje && (
        <div class={mensaje.tipo === "success" ? "alert-success" : "alert-error"}>
          {mensaje.texto}
        </div>
      )}

      {tareas.length === 0
        ? <p style="font-size:13px;color:#666;">No hay tareas registradas.</p>
        : (
          <ul class="task-list">
            {tareas.map((t) => (
              <li class="task-item" key={t._id?.$oid}>
                <label class="task-label">
                  <input
                    type="checkbox"
                    checked={t.completado}
                    disabled={actualizandoId === t._id?.$oid}
                    onChange={(e) =>
                      toggleTarea(
                        t._id!.$oid,
                        e.currentTarget.checked,
                      )}
                  />
                  <span class="task-text">
                    <strong>{t.titulo}</strong>
                    {t.descripcion && (
                      <>
                        <br />
                        <span class="task-desc">{t.descripcion}</span>
                      </>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
