import { assetUrl } from '../assetUrl'

export const artworks = [
  {
    id: 'el-origen',
    title: 'El origen',
    year: '2026',
    src: assetUrl('/artworks/el-origen.png'),
    alt: 'Pavo real que protege una vida en gestación entre sus plumas',
    categories: ['Figuración', 'Naturaleza'],
    layout: 'portrait',
  },
  {
    id: 'el-vuelo',
    title: 'El vuelo',
    year: '2026',
    src: assetUrl('/artworks/el-vuelo.png'),
    alt: 'Niños en un campo alrededor de una gran cometa azul',
    categories: ['Memoria', 'Figuración'],
    layout: 'wide',
  },
  {
    id: 'ritual',
    title: 'Ritual',
    year: '2026',
    src: assetUrl('/artworks/ritual.png'),
    alt: 'Retrato enmarcado de un hombre con un habano',
    categories: ['Figuración', 'Memoria'],
    layout: 'square',
  },
  {
    id: 'marea-interior',
    title: 'Marea interior',
    year: '2026',
    src: assetUrl('/artworks/marea-interior.png'),
    alt: 'Perfil de una mujer iluminada por tonos cálidos frente a una marea azul',
    categories: ['Figuración', 'Naturaleza'],
    layout: 'portrait',
  },
]

export const galleryFilters = ['Todas', 'Figuración', 'Memoria', 'Naturaleza']
