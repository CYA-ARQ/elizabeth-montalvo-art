import { lazy, StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import { ContentProvider } from './content/ContentContext'
import { usePathname } from './router'
import './styles.css'

const AdminPage = lazy(() => import('./pages/AdminPage'))

const pages = {
  '/': HomePage,
  '/sobre-mi': AboutPage,
  '/galeria': GalleryPage,
  '/blog': BlogPage,
  '/contacto': ContactPage,
}

const pageTitles = {
  '/': 'Martha Montalvo — Pintura contemporánea',
  '/sobre-mi': 'Sobre mí — Martha Montalvo',
  '/galeria': 'Galería — Martha Montalvo',
  '/blog': 'Notas & memorias — Martha Montalvo',
  '/contacto': 'Contacto — Martha Montalvo',
  '/administracion': 'Administración privada — Martha Montalvo',
}

function App() {
  const pathname = usePathname()
  const Page = pages[pathname] ?? HomePage
  const isHome = pathname === '/'
  const isAdmin = pathname === '/administracion'
  const hasCompactHeader = !isHome

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = pageTitles[pathname] ?? pageTitles['/']
  }, [pathname])

  if (isAdmin) {
    return (
      <Suspense fallback={<main className="admin-loading">Cargando panel privado…</main>}>
        <AdminPage />
      </Suspense>
    )
  }

  return (
    <div className={`site-shell ${isHome ? 'site-shell--home' : ''}`}>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <Header compact={hasCompactHeader} dark={isHome} />
      <main id="contenido">
        <Page />
      </main>
      <Footer />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)
