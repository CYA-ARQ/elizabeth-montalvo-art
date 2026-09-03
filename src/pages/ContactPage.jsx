import { useState } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import { artworks } from '../data/artworks'

const contactArtwork = artworks.find((artwork) => artwork.id === 'el-vuelo')

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSent(true)
    event.currentTarget.reset()
  }

  return (
    <section className="contact-page">
      <figure className="contact-art reveal">
        <img alt={contactArtwork.alt} fetchPriority="high" src={contactArtwork.src} />
      </figure>
      <div className="contact-panel reveal reveal--delay">
        <h1>Hablemos</h1>
        <p className="contact-intro">
          Para exposiciones, colaboraciones o consultas sobre una obra, escríbeme.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre</span>
            <input autoComplete="name" name="name" required type="text" />
          </label>
          <label>
            <span>Correo</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            <span>Asunto</span>
            <input name="subject" required type="text" />
          </label>
          <label>
            <span>Mensaje</span>
            <textarea name="message" required rows="3" />
          </label>
          <button className="submit-button" type="submit">
            ENVIAR MENSAJE <ArrowIcon />
          </button>
          <p className={`form-status ${sent ? 'is-visible' : ''}`} role="status">
            Gracias. Tu mensaje está listo para ser conectado a tu servicio de correo.
          </p>
        </form>

        <div className="contact-details">
          <div>
            <p>ESTUDIO</p>
            <span>Lima, Perú</span>
          </div>
          <div>
            <p>EMAIL</p>
            <span>Mediante el formulario</span>
          </div>
        </div>
      </div>
    </section>
  )
}
