import { assetUrl } from '../assetUrl'
import { Link } from '../router'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Link className="footer-lockup" to="/">
          <img src={assetUrl('/brand/logo-elizabeth-montalvo.png')} alt="" />
          <span>Elizabeth Montalvo</span>
        </Link>
        <p>Pintura figurativa · Técnica mixta</p>
      </div>
      <div className="footer-links" aria-label="Enlaces del pie de página">
        <Link to="/galeria">Galería</Link>
        <Link to="/sobre-mi">Sobre mí</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contacto">Contacto</Link>
      </div>
      <p className="footer-meta">© {new Date().getFullYear()} Elizabeth Montalvo</p>
    </footer>
  )
}
