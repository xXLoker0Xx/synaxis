# BioLunar · Web instalable

BioLunar es una aplicación web progresiva (PWA) en español, construida con Expo SDK 57, Expo Router, React Native Web y TypeScript. Está configurada para publicarse como sitio estático en Vercel y añadirse a la pantalla de inicio desde un navegador móvil.

## Qué incluye

- **Ciclo solar y lunar:** calcula en el dispositivo amanecer, cenit, atardecer, crepúsculo, iluminación y fase lunar, elongación y signo tropical.
- **Brújula de decisiones:** compara la categoría elegida, la hora local, el contexto solar y la energía autopercibida mediante una matriz heurística.
- **Diario:** registra horas de sueño, minutos de luz exterior y una nota personal.
- **Ubicación:** solicita permiso cuando se pulsa GPS. Si no se concede o no está disponible, utiliza una coordenada de referencia de Ciudad de México.
- **Persistencia:** diarios y evaluaciones se guardan en almacenamiento local del navegador. No existe cuenta ni sincronización con otros navegadores o con una aplicación nativa.
- **Instalación y caché web:** el manifiesto define nombre, icono, modo standalone y accesos directos; el service worker conserva recursos visitados para mejorar la carga y ofrecer una recuperación básica sin conexión.

## Estructura del código

```text
src/
	app/
		+html.tsx             HTML base, metadatos PWA y viewport
		_layout.tsx           Layout Expo Router y registro del service worker
		(tabs)/               Pantallas y navegación inferior
			index.tsx           Ciclo solar/lunar (inicio)
			oracle.tsx           Evaluación de decisiones
			journal.tsx          Diario personal
	components/             Componentes visuales reutilizables
	context/                Coordenadas y permiso de ubicación
	core/
		astronomy/            Cálculo local SunCalc/Meeus
		decisionEngine/       Matriz heurística y textos contextuales
	data/                   Adaptadores AsyncStorage para diario/decisiones
	theme.ts                Colores compartidos
public/
	manifest.json           Metadatos para instalación PWA
	pwa-icon.svg             Icono web
	service-worker.js        Caché de recursos y páginas visitadas
app.json                   Configuración Expo solo web y salida estática
vercel.json                Build y directorio de publicación Vercel
package.json               Dependencias y comandos
package-lock.json          Versiones fijadas de npm
tsconfig.json              TypeScript estricto
README.md                  Esta documentación
```

## Requisitos

- Node.js 22.13 o superior (requerido por Expo SDK 57).
- npm.
- Navegador moderno. Para ubicación y service workers fuera de `localhost`, el sitio debe servirse mediante HTTPS; Vercel lo proporciona.

## Ejecutar y validar localmente

1. En la raíz del repositorio, instala dependencias con `npm install`.
2. Ejecuta `npm run web` y abre la URL local que Expo muestra en la terminal.
3. Ejecuta `npm run typecheck` para validar tipos.
4. Ejecuta `npm run build:web` para generar la versión estática en `dist/`.

Después de una primera visita en `localhost`, inspecciona las tres pestañas, prueba GPS permitiéndolo y denegándolo, guarda un registro y recarga la página. La persistencia se limita al perfil de navegador que la guardó.

## Publicar en Vercel

1. Sube el repositorio a un proveedor Git compatible y conéctalo como un proyecto nuevo de Vercel.
2. Usa la raíz del repositorio como raíz del proyecto y deja que Vercel instale las dependencias con npm.
3. La configuración en `vercel.json` ejecuta `npm run build:web` y publica `dist/`; no añadas un comando de servidor ni una regla de SPA.
4. Despliega y abre la URL HTTPS de vista previa. Cuando las pruebas estén correctas, promueve el despliegue a producción. Los siguientes pushes a la rama de producción publicarán nuevas versiones.

## Instalar en el teléfono

- **Android:** abre el enlace HTTPS de Vercel en Chrome y elige “Instalar aplicación” o “Añadir a pantalla de inicio” en el menú del navegador.
- **iPhone/iPad:** abre el enlace HTTPS en Safari, toca Compartir y selecciona “Añadir a pantalla de inicio”.

La disponibilidad y el texto de instalación varían por navegador. La PWA necesita cargar el sitio al menos una vez. El service worker utiliza red primero para las páginas y caché para recursos; las páginas ya visitadas pueden abrirse sin conexión, pero esto no equivale a sincronización ni garantiza el funcionamiento offline de todas las rutas y datos nuevos.

## Privacidad y límites

La ubicación se pide solo cuando el usuario toca GPS y se usa para los cálculos locales. El diario y las evaluaciones se mantienen en el almacenamiento del mismo navegador. Borrar los datos del sitio puede borrarlos. No se envían datos a un servidor de BioLunar.

Las ventanas circadianas son orientación general y no miden cortisol, dopamina ni cronotipo. La hora límite de cafeína usa como referencia fija acostarse a las 22:30 local. La interpretación lunar es una herramienta reflexiva sin causalidad ni capacidad predictiva. BioLunar no sustituye asesoría médica, legal o financiera.
