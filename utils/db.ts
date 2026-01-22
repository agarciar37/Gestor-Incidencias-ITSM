if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  await import("jsr:@std/dotenv/load");
}

const appId = Deno.env.get("MONGODB_APP_ID");
const apiKey = Deno.env.get("MONGODB_API_KEY");
const dataSource = Deno.env.get("MONGODB_DATA_SOURCE");
const dbName = Deno.env.get("DB_NAME");

if (!appId || !apiKey || !dataSource || !dbName) {
  throw new Error(
    "Faltan variables de entorno: MONGODB_APP_ID, MONGODB_API_KEY, MONGODB_DATA_SOURCE o DB_NAME",
  );
}

const baseUrl =
  `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1/action`;

type Filter = Record<string, unknown>;
type Update = Record<string, unknown>;

export const objectId = (id: string) => ({ $oid: id });

export const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

const serializeValue = (value: unknown): unknown => {
  if (value instanceof Date) {
    return { $date: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("$oid" in record || "$date" in record) {
      return record;
    }
    return Object.fromEntries(
      Object.entries(record).map(([key, val]) => [key, serializeValue(val)]),
    );
  }

  return value;
};

const normalizeDate = (value: unknown): Date | unknown => {
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("$date" in record) {
      const dateValue = record.$date as
        | string
        | { $numberLong: string };
      if (typeof dateValue === "string") {
        return new Date(dateValue);
      }
      if (
        dateValue && typeof dateValue === "object" &&
        "$numberLong" in dateValue
      ) {
        return new Date(Number(dateValue.$numberLong));
      }
    }
  }

  return value;
};

const normalizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("$oid" in record) {
      return record.$oid;
    }
    const normalizedDate = normalizeDate(value);
    if (normalizedDate instanceof Date) {
      return normalizedDate;
    }
    return Object.fromEntries(
      Object.entries(record).map(([key, val]) => [key, normalizeValue(val)]),
    );
  }

  return value;
};

const normalizeDocument = <T>(doc: T): T => {
  return normalizeValue(doc) as T;
};

const callDataApi = async <T>(action: string, body: Record<string, unknown>) => {
  const resp = await fetch(`${baseUrl}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      dataSource,
      database: dbName,
      ...serializeValue(body) as Record<string, unknown>,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(
      `MongoDB Data API error (${resp.status}): ${errorText}`,
    );
  }

  return await resp.json() as T;
};

class DataApiQuery<T> {
  private sortSpec?: Record<string, 1 | -1>;

  constructor(
    private readonly collectionName: string,
    private readonly filter: Filter,
  ) {}

  sort(sort: Record<string, 1 | -1>) {
    this.sortSpec = sort;
    return this;
  }

  async toArray(): Promise<T[]> {
    const result = await callDataApi<{ documents: T[] }>("find", {
      collection: this.collectionName,
      filter: this.filter,
      ...(this.sortSpec ? { sort: this.sortSpec } : {}),
    });

    return result.documents.map((doc) => normalizeDocument(doc));
  }
}

class DataApiCollection<T> {
  constructor(private readonly collectionName: string) {}

  find(filter: Filter = {}) {
    return new DataApiQuery<T>(this.collectionName, filter);
  }

  async findOne(filter: Filter = {}): Promise<T | null> {
    const result = await callDataApi<{ document: T | null }>("findOne", {
      collection: this.collectionName,
      filter,
    });

    return result.document ? normalizeDocument(result.document) : null;
  }

  async insertOne(document: T) {
    const result = await callDataApi<{ insertedId: { $oid: string } }>(
      "insertOne",
      {
        collection: this.collectionName,
        document,
      },
    );

    return { insertedId: result.insertedId.$oid };
  }

  async updateOne(filter: Filter, update: Update) {
    const result = await callDataApi<{
      matchedCount: number;
      modifiedCount: number;
    }>("updateOne", {
      collection: this.collectionName,
      filter,
      update,
    });

    return result;
  }

  async countDocuments(filter: Filter = {}) {
    const result = await callDataApi<{ count: number }>("countDocuments", {
      collection: this.collectionName,
      filter,
    });

    return result.count;
  }
}

export const incidencias = new DataApiCollection("incidencias");
export const tareas = new DataApiCollection("tareas");
export const audit_log = new DataApiCollection("audit_log");
