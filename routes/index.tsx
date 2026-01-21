import { Handlers, PageProps } from "$fresh/server.ts";
import { incidencias } from "../utils/db.ts";
import { Dashboard, Incidencia } from "../types.ts";
import Header from "../components/Header.tsx";
import DashboardCards from "../components/Dashboard.tsx";
import FormNuevaIncidencia from "../components/FormNuevaIncidencia.tsx";
import InfoAside from "../components/InfoAside.tsx";
import IncidenciasList from "../islands/IncidenciasList.tsx";

export const handler: Handlers = {
  async GET(_, ctx) {
    const data = await incidencias.find({}).toArray();

    const dashboard: Dashboard = {
      total: data.length,
      abiertas: data.filter((i) => i.estado === "abierta").length,
      enCurso: data.filter((i) => i.estado === "en curso").length,
      cerradas: data.filter((i) => i.estado === "cerrada").length,
    };

    return ctx.render({ data, dashboard });
  },

  async POST(req) {
    const form = await req.formData();
    const titulo = form.get("titulo")?.toString() || "";
    const descripcion = form.get("descripcion")?.toString() || "";
    const prioridad = form.get("prioridad")?.toString() as
      | "baja"
      | "media"
      | "alta";

    if (!titulo || !descripcion || !prioridad) {
      return new Response("Faltan campos obligatorios", { status: 400 });
    }

    const nueva: Omit<Incidencia, "_id"> = {
      titulo,
      descripcion,
      prioridad,
      estado: "abierta",
      fecha_creacion: new Date(),
    };

    if (prioridad === "alta") {
      nueva.tecnico = "Técnico principal";
    }

    await incidencias.insertOne(nueva);

    return new Response("", {
      status: 303,
      headers: { Location: "/" },
    });
  },
};

interface HomeData {
  data: Incidencia[];
  dashboard: Dashboard;
}

export default function Home({ data }: PageProps<HomeData>) {
  const { dashboard, data: incidenciasData } = data as HomeData;

  return (
    <div class="main-bg">
      <main class="container">
        <Header />
        <DashboardCards dashboard={dashboard} />

        <section class="main-grid">
          <FormNuevaIncidencia />
          <InfoAside />
        </section>

        <section>
          <h2 class="list-section-title">Incidencias registradas</h2>
          <p class="list-section-subtitle">
            Visualiza, filtra y actualiza el estado de las incidencias activas.
          </p>
          <IncidenciasList incidencias={incidenciasData} />
        </section>
      </main>
    </div>
  );
}
