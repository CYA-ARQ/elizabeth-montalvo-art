import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import { usePathname } from './router'
import './styles.css'

const pages = {
  '/': HomePage,
  '/sobre-mi': AboutPage,
  '/galeria': GalleryPage,
  '/blog': BlogPage,
  '/contacto': ContactPage,
}

const pageTitles = {
  '/': 'Elizabeth Montalvo — Pintura contemporánea',
  '/sobre-mi': 'Sobre mí — Elizabeth Montalvo',
  '/galeria': 'Galería — Elizabeth Montalvo',
  '/blog': 'Notas & memorias — Elizabeth Montalvo',
  '/contacto': 'Contacto — Elizabeth Montalvo',
}

function App() {
  const pathname = usePathname()
  const Page = pages[pathname] ?? HomePage
  const isHome = pathname === '/'
  const hasCompactHeader = !isHome

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.title = pageTitles[pathname] ?? pageTitles['/']
  }, [pathname])

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
    <App />
  </StrictMode>,
)
