# Registro USDT · Bs

App móvil (PWA) para registrar transacciones de compra/venta de USDT contra
Bolívares, con sincronización en tiempo real entre varios dispositivos a
través de un Google Sheet. 100% gratis: se hospeda en GitHub Pages y usa
Google Apps Script como backend.

## 1) Backend: Google Sheets + Apps Script

1. Crea una hoja de cálculo nueva en Google Sheets (el nombre no importa).
2. Ve a **Extensiones > Apps Script**.
3. Borra el contenido de `Code.gs` y pega el contenido del archivo
   [`apps-script.gs`](./apps-script.gs) de este repositorio.
4. Clic en **Implementar > Nueva implementación**.
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Autoriza los permisos que te pida Google (es tu propio script).
6. Copia la **URL de la aplicación web** (termina en `/exec`). La necesitarás
   en el paso 3.

Cada vez que edites el script y quieras que los cambios se apliquen, entra a
**Implementar > Gestionar implementaciones**, edita la implementación
existente y sube una nueva versión (así la URL no cambia).

## 2) Publicar la app en GitHub Pages (gratis)

1. Crea una cuenta en [github.com](https://github.com) si no tienes una.
2. Crea un repositorio nuevo, público, por ejemplo `registro-usdt-bs`.
3. Sube todos los archivos de esta carpeta al repositorio:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icons/icon-192.png`
   - `icons/icon-512.png`
   - `apps-script.gs` (queda solo como referencia, no se ejecuta en GitHub)
   - `README.md`

   Puedes hacerlo arrastrando los archivos desde la página del repositorio
   ("Add file > Upload files") o con git:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de la app"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/registro-usdt-bs.git
   git push -u origin main
   ```
4. En el repositorio, ve a **Settings > Pages**.
5. En "Build and deployment", selecciona **Deploy from a branch**, rama
   `main`, carpeta `/root`, y guarda.
6. En un par de minutos tu app quedará disponible en:
   `https://TU-USUARIO.github.io/registro-usdt-bs/`

## 3) Configurar la app en tu teléfono

1. Abre la URL de GitHub Pages en Chrome (Android).
2. Ve a la pestaña **Ajustes** dentro de la app y pega la URL de Apps Script
   (la que termina en `/exec`) en "URL de Google Apps Script (Web App)".
3. Repite este paso en cada dispositivo que quieras sincronizar — todos los
   que usen la misma URL comparten los mismos registros.
4. En Chrome, toca el menú (⋮) y elige **"Añadir a pantalla de inicio"** para
   que quede como un ícono de app normal en tu teléfono.

## Cómo funciona la sincronización

- Cada transacción tiene un **ID único**, así que nunca se duplica aunque se
  cree o edite desde varios teléfonos a la vez.
- La app revisa el Google Sheet cada pocos segundos (configurable en
  Ajustes) y también envía cualquier cambio nuevo apenas ocurre: crear,
  editar o eliminar una transacción se refleja en la hoja y en los demás
  dispositivos en el siguiente ciclo de sincronización.
- Las eliminaciones son "suaves": la fila no se borra de la hoja, se marca
  como `Deleted = TRUE`, para que todos los dispositivos se enteren de que
  debe desaparecer.

### Nota sobre el intervalo de 1 segundo

Google Apps Script es gratuito pero no está pensado para sondeo (`polling`)
extremadamente frecuente y constante las 24 horas. Revisar cada 1 segundo
funciona bien para uso normal (la app abierta mientras registras
transacciones), pero si vas a dejar la app abierta todo el día en varios
teléfonos, considera subir el intervalo a 3-5 segundos en Ajustes para
ahorrar batería y evitar que Google limite las solicitudes por uso excesivo.
