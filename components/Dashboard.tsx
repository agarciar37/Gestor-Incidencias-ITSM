import { Dashboard } from "../types.ts";

interface Props {
  dashboard: Dashboard;
}

export default function DashboardCards({ dashboard }: Props) {
  const cards = [
    {
      titulo: "Total",
      valor: dashboard.total,
      subtitulo: "Incidencias registradas",
    },
    {
      titulo: "Abiertas",
      valor: dashboard.abiertas,
      subtitulo: "Pendientes de inicio",
    },
    {
      titulo: "En curso",
      valor: dashboard.enCurso,
      subtitulo: "En resolución",
    },
    {
      titulo: "Cerradas",
      valor: dashboard.cerradas,
      subtitulo: "Completadas",
    },
  ];

  return (
    <section class="dashboard">
      {cards.map((c) => (
        <article class="dash-card" key={c.titulo}>
          <p class="dash-card-title">{c.titulo}</p>
          <p class="dash-card-value">{c.valor}</p>
          <p class="dash-card-subtitle">{c.subtitulo}</p>
        </article>
      ))}
    </section>
  );
}
