import { useEffect, useState } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import { artworks } from '../data/artworks'
import { Link } from '../router'

const selectedWorks = artworks.filter((artwork) =>
  ['el-vuelo', 'ritual'].includes(artwork.id),
)

const heroSlides = ['ritual', 'el-vuelo', 'el-origen', 'marea-interior'].map(
  (id) => artworks.find((artwork) => artwork.id === id),
)

const SLIDE_DURATION = 3800

export default function HomePage() {
  const [{ activeIndex, previousIndex }, setSlideState] = useState({
    activeIndex: 0,
    previousIndex: null,
  })
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncMotionPreference = () => {
      if (motionPreference.matches) {
        setIsPlaying(false)
      }
    }

    syncMotionPreference()
    motionPreference.addEventListener('change', syncMotionPreference)
    return () => motionPreference.removeEventListener('change', syncMotionPreference)
  }, [])

  useEffect(() => {
    if (!isPlaying) return undefined

    const intervalId = window.setInterval(() => {
      setSlideState(({ activeIndex: currentIndex }) => ({
        activeIndex: (currentIndex + 1) % heroSlides.length,
        previousIndex: currentIndex,
      }))
    }, SLIDE_DURATION)

    return () => window.clearInterval(intervalId)
  }, [isPlaying])

  const currentFrame = activeIndex + 1

  return (
    <>
      <section className="cinematic-home" aria-labelledby="home-title">
        <div className="cinematic-stage reveal">
          <div
            aria-label="Secuencia animada de pinturas de Elizabeth Montalvo"
            aria-roledescription="carrusel"
            className={`cinematic-media ${isPlaying ? '' : 'is-paused'}`}
            role="region"
          >
            <div className="painting-reel">
              {heroSlides.map((artwork, index) => {
                const isActive = index === activeIndex
                const isLeaving = index === previousIndex

                return (
                  <figure
                    aria-hidden={!isActive}
                    className={`painting-slide ${isActive ? 'is-active' : ''} ${
                      isLeaving ? 'is-leaving' : ''
                    }`}
                    key={artwork.id}
                  >
                    <img
                      alt={isActive ? artwork.alt : ''}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      src={artwork.src}
                    />
                  </figure>
                )
              })}
            </div>
            <span className="cinematic-media-label">PINTURAS EN MOVIMIENTO</span>
          </div>

          <div className="cinematic-copy">
            <p className="art-index">ELIZABETH MONTALVO / OBRA EN MOVIMIENTO</p>
            <h1
              aria-label="Pinto lo que permanece cuando todo cambia."
              id="home-title"
            >
              <span>Pinto lo que permanece</span>
              <span>cuando todo cambia.</span>
            </h1>
            <p className="hero-lead">
              Cuerpo, memoria y naturaleza en obras que habitan lo íntimo.
            </p>
            <Link className="text-link text-link--cinematic" to="/galeria">
              VER GALERÍA <ArrowIcon />
            </Link>
          </div>

          <img
            alt="Detalle de Marea interior, figura femenina sobre un flujo de agua y luz"
            className="cinematic-cutout"
            fetchPriority="high"
            src="/hero/marea-cutout.png"
          />

          <div className="cinematic-controls" aria-label="Controles de la animación">
            <span aria-live="polite">
              {String(currentFrame).padStart(2, '0')} <i>/</i> 04
            </span>
            <span className="cinematic-progress" aria-hidden="true">
              <i style={{ transform: `scaleX(${currentFrame / 4})` }} />
            </span>
            <button
              aria-label={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
              aria-pressed={!isPlaying}
              className="playback-button"
              onClick={() => setIsPlaying((current) => !current)}
              type="button"
            >
              {isPlaying ? (
                <span className="pause-icon" aria-hidden="true" />
              ) : (
                <span className="play-icon" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="selected-section section-pad">
        <div className="section-heading-row">
          <h2>Obras seleccionadas</h2>
          <Link className="text-link text-link--small" to="/galeria">
            VER TODAS <ArrowIcon />
          </Link>
        </div>
        <div className="selected-grid">
          {selectedWorks.map((artwork) => (
            <Link className="selected-work" key={artwork.id} to="/galeria">
              <div className={`selected-media selected-media--${artwork.layout}`}>
                <img alt={artwork.alt} loading="lazy" src={artwork.src} />
              </div>
              <div>
                <h3>{artwork.title}</h3>
                <p>{artwork.year}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-statement section-pad">
        <p>La pintura como lugar de memoria.</p>
        <blockquote>
          “Me interesan esos instantes en los que lo cotidiano se vuelve símbolo.”
        </blockquote>
        <Link className="text-link text-link--light" to="/sobre-mi">
          CONOCER MI PROCESO <ArrowIcon />
        </Link>
      </section>
    </>
  )
}
