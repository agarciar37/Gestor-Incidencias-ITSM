export default function Header() {
  return (
    <header class="sn-header">
      <div class="sn-topbar">
        <div class="sn-brand">
          <span class="sn-brand-mark">SN</span>
          <div>
            <p class="sn-brand-title">ServiceNow</p>
            <p class="sn-brand-subtitle">ITSM Workspace</p>
          </div>
        </div>
        <div class="sn-topbar-meta">
          <span class="sn-status-dot" aria-hidden="true"></span>
          <span>Estado del servicio: Operativo</span>
        </div>
      </div>

      <div class="sn-hero">
        <div>
          <div class="sn-badge">🧾 Plataforma ITSM</div>
          <h1 class="sn-title">Panel de control de incidencias</h1>
          <p class="sn-subtitle">
            Supervisa, prioriza y da seguimiento al ciclo de vida de las incidencias,
            replicando el comportamiento de una herramienta ITSM como ServiceNow.
          </p>
        </div>
        <div class="sn-hero-card">
          <p class="sn-hero-label">Centro de operaciones</p>
          <p class="sn-hero-value">Incidencias bajo control</p>
          <p class="sn-hero-meta">Última actualización: hace 2 min</p>
        </div>
      </div>
    </header>
  );
}
