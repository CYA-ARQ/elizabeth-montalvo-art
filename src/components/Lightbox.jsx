import { useEffect, useRef } from 'react'
import ArrowIcon from './ArrowIcon'

export default function Lightbox({ artworks, activeId, onClose, onChange }) {
  const closeButtonRef = useRef(null)
  const activeIndex = artworks.findIndex((artwork) => artwork.id === activeId)
  const activeArtwork = activeIndex >= 0 ? artworks[activeIndex] : null

  useEffect(() => {
    if (!activeArtwork) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        onChange(artworks[(activeIndex + 1) % artworks.length].id)
      }
      if (event.key === 'ArrowLeft') {
        onChange(artworks[(activeIndex - 1 + artworks.length) % artworks.length].id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [activeArtwork, activeIndex, artworks, onChange, onClose])

  if (!activeArtwork) return null

  const previousId = artworks[(activeIndex - 1 + artworks.length) % artworks.length].id
  const nextId = artworks[(activeIndex + 1) % artworks.length].id

  return (
    <div
      aria-label={`Vista ampliada: ${activeArtwork.title}`}
      aria-modal="true"
      className="lightbox"
      role="dialog"
    >
      <button
        aria-label="Cerrar obra ampliada"
        className="lightbox-close"
        onClick={onClose}
        ref={closeButtonRef}
        type="button"
      >
        <span />
        <span />
      </button>

      <button
        aria-label="Obra anterior"
        className="lightbox-arrow lightbox-arrow--previous"
        onClick={() => onChange(previousId)}
        type="button"
      >
        <ArrowIcon direction="left" />
      </button>

      <figure className="lightbox-figure">
        <img alt={activeArtwork.alt} src={activeArtwork.src} />
        <figcaption>
          <span>{activeArtwork.title}</span>
          <span>{activeArtwork.year}</span>
        </figcaption>
      </figure>

      <button
        aria-label="Obra siguiente"
        className="lightbox-arrow lightbox-arrow--next"
        onClick={() => onChange(nextId)}
        type="button"
      >
        <ArrowIcon />
      </button>
    </div>
  )
}
