// components/InfoAside.tsx
export default function InfoAside() {
  return (
    <aside class="aside-box">
      <div class="aside-header">
        <h3>Buenas prácticas ITSM</h3>
        <span class="aside-pill">Guía rápida</span>
      </div>
      <p>
        Un registro claro de las incidencias facilita la priorización, el análisis
        posterior y la mejora continua del servicio.
      </p>
      <ul class="aside-list">
        <li>Usa siempre títulos descriptivos y concisos.</li>
        <li>Actualiza el estado a “En curso” cuando se esté trabajando activamente.</li>
        <li>Cierra solo cuando exista confirmación por parte del usuario.</li>
        <li>Registra la prioridad en función del impacto y la urgencia.</li>
      </ul>
      <div class="aside-footer">
        <span>SLA configurado</span>
        <span>3 recordatorios activos</span>
      </div>
    </aside>
  );
}
