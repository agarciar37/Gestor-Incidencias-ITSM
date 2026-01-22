# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

### MongoDB (Deno Deploy)

Deno Deploy no permite conexiones TCP directas, por lo que la aplicación usa
MongoDB Data API. Configura estas variables de entorno:

```
MONGODB_APP_ID=<app-id-de-atlas>
MONGODB_API_KEY=<api-key-de-data-api>
MONGODB_DATA_SOURCE=<nombre-del-data-source>
DB_NAME=<nombre-de-la-base>
```

En Atlas, habilita la Data API para tu proyecto y crea un API Key con permisos
de lectura/escritura para las colecciones usadas por la app.
