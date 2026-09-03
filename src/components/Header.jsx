import { useEffect, useState } from 'react'
import { NavLink, usePathname } from '../router'

const links = [
  { label: 'INICIO', to: '/' },
  { label: 'SOBRE MÍ', to: '/sobre-mi' },
  { label: 'GALERÍA', to: '/galeria' },
  { label: 'BLOG', to: '/blog' },
  { label: 'CONTACTO', to: '/contacto' },
]

export default function Header({ compact = false, dark = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen)
    return () => document.body.classList.remove('menu-is-open')
  }, [menuOpen])

  return (
    <header
      className={`site-header ${dark ? 'site-header--dark' : ''} ${
        compact ? 'site-header--compact' : ''
      }`}
    >
      <NavLink
        className="brand-lockup"
        to="/"
        aria-label="Elizabeth Montalvo, ir al inicio"
      >
        <img
          className="brand-logo"
          src={
            dark
              ? '/brand/logo-elizabeth-montalvo-white.png'
              : '/brand/logo-elizabeth-montalvo.png'
          }
          alt=""
        />
        <span>Elizabeth Montalvo</span>
      </NavLink>

      <button
        aria-controls="main-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        className="menu-toggle"
        onClick={() => setMenuOpen((current) => !current)}
        type="button"
      >
        <span />
        <span />
      </button>

      <nav
        aria-label="Navegación principal"
        className={`main-nav ${menuOpen ? 'is-open' : ''}`}
        id="main-navigation"
      >
        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              end={link.to === '/'}
              key={link.to}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
