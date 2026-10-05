import ArrowIcon from '../components/ArrowIcon'
import { assetUrl } from '../assetUrl'
import { useSiteContent } from '../content/ContentContext'
import { Link } from '../router'

export default function AboutPage() {
  const { siteContent } = useSiteContent()

  return (
    <>
      <section className="about-hero">
        <figure className="about-art reveal">
          <img
            alt="Martha Montalvo pintando en su taller"
            fetchPriority="high"
            src={assetUrl('/about/martha-montalvo-at-work.jpg')}
          />
        </figure>
        <div className="about-copy reveal reveal--delay">
          <img
            alt=""
            aria-hidden="true"
            className="about-watermark"
            src={assetUrl('/brand/logo-elizabeth-montalvo.png')}
          />
          <h1>Sobre mí</h1>
          <p className="about-lead">{siteContent.aboutLead}</p>
          <div className="about-body">
            <p>{siteContent.aboutParagraphOne}</p>
            <p>{siteContent.aboutParagraphTwo}</p>
          </div>
          <p className="practice-line">{siteContent.practiceLine}</p>
        </div>
        <img
          alt=""
          aria-hidden="true"
          className="about-kite"
          src={assetUrl('/about/el-vuelo-kite.png')}
        />
      </section>

      <section className="process-section section-pad">
        <div>
          <p className="section-number">01</p>
          <h2>Observación</h2>
          <p>Todo comienza con una imagen que insiste: una mirada, una textura, una pausa.</p>
        </div>
        <div>
          <p className="section-number">02</p>
          <h2>Memoria</h2>
          <p>La escena se mezcla con recuerdos y símbolos hasta encontrar su propia voz.</p>
        </div>
        <div>
          <p className="section-number">03</p>
          <h2>Materia</h2>
          <p>Capas, color y trazo construyen una superficie que invita a mirar despacio.</p>
        </div>
      </section>

      <section className="about-cta section-pad">
        <h2>Descubre las historias detrás de cada imagen.</h2>
        <Link className="text-link" to="/galeria">
          IR A LA GALERÍA <ArrowIcon />
        </Link>
      </section>
    </>
  )
}
