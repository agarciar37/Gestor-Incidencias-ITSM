import { useEffect, useState } from "preact/hooks";
import { Tarea } from "../types.ts";

interface Props {
  incidenciaId: string;
}

export default function TareasIncidencia({ incidenciaId }: Props) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [tituloNuevaTarea, setTituloNuevaTarea] = useState("");
  const [descripcionNuevaTarea, setDescripcionNuevaTarea] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarTareas = async () => {
    try {
      const res = await fetch(`/api/tareas?incidenciaId=${incidenciaId}`);
      const data = await res.json();
      setTareas(data);
    } catch (e) {
      setError("Error cargando tareas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  const crearTarea = async () => {
    if (!tituloNuevaTarea.trim()) return;

    await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidenciaId,
        titulo: tituloNuevaTarea,
        descripcion: descripcionNuevaTarea,
      }),
    });

    setTituloNuevaTarea("");
    setDescripcionNuevaTarea("");
    cargarTareas();
  };

  const alternarCompletada = async (tareaId: string, completada: boolean) => {
    await fetch("/api/tareas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tareaId, completada }),
    });

    setTareas((prev) =>
      prev.map((t) =>
        t._id?.toString() === tareaId
          ? {
              ...t,
              completada,
              fecha_completada: completada ? new Date() : undefined,
            }
          : t
      )
    );
  };

  return (
    <div class="sn-task-panel">
      <div class="sn-task-header">
        <h3 class="sn-task-title">Tareas de la incidencia</h3>

        <button
          class="sn-add-task-btn"
          onClick={(e) => {
            e.preventDefault();
            crearTarea();
          }}
        >
          Añadir tarea
        </button>
      </div>

      <div class="sn-new-task-form">
        <input
          class="sn-input"
          placeholder="Título de la tarea"
          value={tituloNuevaTarea}
          onInput={(e) => setTituloNuevaTarea(e.currentTarget.value)}
        />
        <textarea
          class="sn-textarea"
          placeholder="Descripción (opcional)"
          value={descripcionNuevaTarea}
          onInput={(e) => setDescripcionNuevaTarea(e.currentTarget.value)}
        />
      </div>

      {cargando && <p>Cargando tareas…</p>}
      {error && <p class="sn-error">{error}</p>}

      <ul class="sn-task-list">
        {tareas.length === 0 && !cargando && (
          <p class="sn-empty">No hay tareas creadas.</p>
        )}

        {tareas.map((t) => {
          const tareaId = t._id?.toString();

          return (
            <li class="sn-task-item" key={tareaId}>
              <label class="sn-task-checkbox-container">
                <input
                  type="checkbox"
                  checked={t.completada}
                  onChange={(e) =>
                    alternarCompletada(tareaId!, e.currentTarget.checked)
                  }
                />
                <span class="sn-custom-checkbox"></span>
              </label>

              <div class="sn-task-content">
                <p class={`sn-task-titulo ${t.completada ? "sn-task-done" : ""}`}>
                  {t.titulo}
                </p>

                {t.descripcion && (
                  <p class="sn-task-desc">{t.descripcion}</p>
                )}

                {t.fecha_completada && (
                  <p class="sn-task-date">
                    Completada el{" "}
                    {new Date(t.fecha_completada).toLocaleString()}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
