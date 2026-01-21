// utils/db.ts
import { MongoClient } from "npm:mongodb@6.20.0";
import type { Collection, Db } from "npm:mongodb@6.20.0";

// Cargar .env solo en local
if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  await import("jsr:@std/dotenv/load");
}

const uri = Deno.env.get("MONGO_URL");
const dbName = Deno.env.get("DB_NAME");

if (!uri || !dbName) {
  throw new Error("❌ Faltan variables de entorno MONGO_URL o DB_NAME");
}

let client: MongoClient | null = null;
let db: Db | null = null;
let connecting: Promise<Db> | null = null;

// Conexión lazy + cacheada (evita conectar en build/import)
export async function getDb(): Promise<Db> {
  if (db) return db;
  if (connecting) return connecting;

  connecting = (async () => {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log("✅ Conectado a MongoDB correctamente");
    return db;
  })();

  return connecting;
}

export async function getCollections(): Promise<{
  incidencias: Collection;
  tareas: Collection;
  audit_log: Collection;
}> {
  const database = await getDb();
  return {
    incidencias: database.collection("incidencias"),
    tareas: database.collection("tareas"),
    audit_log: database.collection("audit_log"),
  };
}
