import { useState, useMemo, useEffect } from "preact/hooks";
import { Incidencia } from "../types.ts";

interface Props {
  incidencias: Incidencia[];
}

export default function IncidenciasList({ incidencias }: Props) {
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [prioridadFiltro, setPrioridadFiltro] = useState("todas");
  const [lista, setLista] = useState(incidencias);

  useEffect(() => {
    setLista(incidencias);
  }, [incidencias]);

  const filtrar = (i: Incidencia) => {
    const matchEstado =
      estadoFiltro === "todos" || i.estado === estadoFiltro;
    const matchPrioridad =
      prioridadFiltro === "todas" || i.prioridad === prioridadFiltro;
    return matchEstado && matchPrioridad;
  };

  const resultados = useMemo(
    () => lista.filter(filtrar),
    [lista, estadoFiltro, prioridadFiltro],
  );

  const resetFiltros = () => {
    setEstadoFiltro("todos");
    setPrioridadFiltro("todas");
  };

  const getEstadoClase = (estado: string) => {
    if (estado === "abierta") return "state-chip state-open";
    if (estado === "en curso") return "state-chip state-progress";
    return "state-chip state-closed";
  };

  const getPrioridadClase = (prioridad: string) => {
    if (prioridad === "alta") return "inc-card inc-high";
    if (prioridad === "media") return "inc-card inc-medium";
    return "inc-card inc-low";
  };

  return (
    <div class="space-y-6">
      {/**/}
      <div class="filter-bar">
        <div>
          <label class="filter-label">Estado</label>
          <select
            class="filter-select"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.currentTarget.value)}
          >
            <option value="todos">Todos</option>
            <option value="abierta">Abierta</option>
            <option value="en curso">En curso</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </div>

        <div>
          <label class="filter-label">Prioridad</label>
          <select
            class="filter-select"
            value={prioridadFiltro}
            onChange={(e) => setPrioridadFiltro(e.currentTarget.value)}
          >
            <option value="todas">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <button onClick={resetFiltros} class="filter-reset">
          Restablecer
        </button>
      </div>

      {/**/}
      {(estadoFiltro !== "todos" || prioridadFiltro !== "todas") && (
        <div class="active-filters">
          {estadoFiltro !== "todos" && (
            <span class={`chip ${getEstadoClase(estadoFiltro)}`}>
              Estado: {estadoFiltro}
            </span>
          )}

          {prioridadFiltro !== "todas" && (
            <span class={`chip prioridad-${prioridadFiltro}`}>
              Prioridad: {prioridadFiltro}
            </span>
          )}
        </div>
      )}

      {/**/}
      <p class="result-count">
        Mostrando {resultados.length} de {lista.length} incidencias
      </p>

      {/**/}
      {resultados.length === 0
        ? <p>No hay incidencias que coincidan.</p>
        : (
          <ul class="inc-list">
            {resultados.map((i) => {
              const oid = i._id?.toString();

              if (!oid || !/^[0-9a-fA-F]{24}$/.test(oid)) {
                console.error("⚠️ ID de incidencia inválido:", i);
                return (
                  <li class={getPrioridadClase(i.prioridad)} key={i.titulo}>
                    <div class="inc-card-header">
                      <div>
                        <p class="inc-title-label">Incidencia (ID inválido)</p>
                        <h3 class="inc-title">{i.titulo}</h3>
                      </div>
                    </div>
                    <p class="inc-description">{i.descripcion}</p>
                  </li>
                );
              }

              return (
                <li key={oid}>
                  <a
                    href={`/incidencia/${oid}`}
                    class={`${getPrioridadClase(i.prioridad)} inc-clickable`}
                  >
                    <div class="inc-card-header">
                      <div>
                        <p class="inc-title-label">Incidencia</p>
                        <h3 class="inc-title">{i.titulo}</h3>
                      </div>

                      <span class={getEstadoClase(i.estado)}>
                        {i.estado.toUpperCase()}
                      </span>
                    </div>

                    <p class="inc-description">{i.descripcion}</p>

                    <div class="inc-meta-row">
                      <span class="meta-badge">
                        Prioridad: <strong>{i.prioridad}</strong>
                      </span>

                      {i.tecnico && (
                        <span class="meta-badge meta-tech">
                          Técnico: <strong>{i.tecnico}</strong>
                        </span>
                      )}
                    </div>

                    <div class="inc-dates">
                      <div>
                        Creada el:{" "}
                        {new Date(i.fecha_creacion).toLocaleString()}
                      </div>

                      {i.fecha_cierre && (
                        <div>
                          Cerrada el:{" "}
                          {new Date(i.fecha_cierre).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
    </div>
  );
}
