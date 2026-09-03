import ArrowIcon from '../components/ArrowIcon'
import { assetUrl } from '../assetUrl'
import { Link } from '../router'

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <figure className="about-art reveal">
          <img
            alt="Retrato de la artista Elizabeth Montalvo"
            fetchPriority="high"
            src={assetUrl('/about/elizabeth-montalvo.jpg')}
          />
        </figure>
        <div className="about-copy reveal reveal--delay">
          <span className="about-monogram" aria-hidden="true">M</span>
          <h1>Sobre mí</h1>
          <p className="about-lead">
            Pinto para escuchar lo que las palabras no alcanzan.
          </p>
          <div className="about-body">
            <p>
              Soy Elizabeth Montalvo. Mi práctica artística nace de la observación
              atenta de la vida cotidiana, la memoria y la naturaleza. Me interesa
              lo que permanece en silencio: gestos mínimos, miradas, texturas y
              luces que cambian sin avisar.
            </p>
            <p>
              Trabajo la figura humana y el paisaje como territorios emocionales.
              El cuerpo, en toda su fragilidad y fuerza, es un lugar donde se
              cruzan lo personal y lo universal. Pinto para comprender, acompañar
              y recordar lo esencial.
            </p>
          </div>
          <p className="practice-line">Pintura figurativa · Técnica mixta</p>
        </div>
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
