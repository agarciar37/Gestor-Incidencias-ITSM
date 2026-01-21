import { MongoClient } from "npm:mongodb";

if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  await import("jsr:@std/dotenv/load");
}

const uri = "mongodb+srv://itsm_user:1234@cluster0.bm2imrw.mongodb.net/?appName=Cluster0"
const dbName = "itsm_db"

if (!uri || !dbName) {
  throw new Error("Faltan variables de entorno MONGO_URL o DB_NAME");
}

const client = new MongoClient(uri);
await client.connect();

console.log("Conectado a MongoDB correctamente");

export const db = client.db(dbName);

export const incidencias = db.collection("incidencias");
export const tareas = db.collection("tareas");
export const audit_log = db.collection("audit_log");
