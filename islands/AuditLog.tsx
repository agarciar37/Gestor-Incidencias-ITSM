import { useEffect, useState } from "preact/hooks";

interface Log {
  _id: string;
  usuario: string;
  accion: string;
  fecha: string;
}

export default function AuditLog({ incidenciaId }: { incidenciaId: string }) {
  const [logs, setLogs] = useState<Log[]>([]);

  const cargar = async () => {
    const res = await fetch(`/api/audit?id=${incidenciaId}`);
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div class="sn-audit-panel">
      <h3 class="sn-audit-title">Historial de cambios</h3>

      <ul class="sn-audit-list">
        {logs.map((log) => (
          <li key={log._id} class="sn-audit-item">
            <p class="sn-audit-action">{log.accion}</p>
            <p class="sn-audit-date">
              {new Date(log.fecha).toLocaleString()} — {log.usuario}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
