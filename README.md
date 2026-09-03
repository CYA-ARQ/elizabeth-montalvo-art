# Elizabeth Montalvo — Portafolio artístico

Portafolio editorial y responsive desarrollado con React + Vite. Incluye Inicio,
Sobre mí, Galería, Blog y Contacto.

## Funcionalidades

- Hero animado con transición horizontal entre pinturas y control de reproducción.
- Galería filtrable con visor de obra.
- Biografía y retrato de Elizabeth Montalvo.
- Blog de notas y memorias con lectura en panel lateral.
- Editor para crear notas, elegir categoría y adjuntar una portada.
- Persistencia local de las notas creadas en el navegador.
- Diseño adaptable, navegación móvil y soporte para movimiento reducido.

## Ejecutar

```bash
npm install
npm run dev
```

Para crear la versión de producción:

```bash
npm run build
npm run preview
```

## Personalización rápida

- Datos y nombres de obras: `src/data/artworks.js`
- Entradas editoriales iniciales: `src/data/blogPosts.js`
- Texto biográfico: `src/pages/AboutPage.jsx`
- Correo y ubicación: `src/pages/ContactPage.jsx`
- Paleta y estilo visual: variables al inicio de `src/styles.css`
- Las notas creadas desde el blog se guardan en `localStorage`. Para publicación
  compartida entre dispositivos debe conectarse posteriormente un CMS o backend.
- El formulario de contacto demuestra la interacción local; conecta `handleSubmit`
  con el servicio de correo elegido antes de publicarlo.

Las pinturas están en `public/artworks/`, el retrato en `public/about/`, el logo en
`public/brand/` y los conceptos visuales en `design-concepts/`.

## Autoría

Obra visual y contenidos de Elizabeth Montalvo. Código del portafolio preparado
para su publicación y personalización.
