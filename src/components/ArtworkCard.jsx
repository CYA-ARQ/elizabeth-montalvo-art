export default function ArtworkCard({ artwork, onOpen, priority = false }) {
  return (
    <article className={`artwork-card artwork-card--${artwork.layout}`}>
      <button
        aria-label={`Ampliar ${artwork.title}`}
        className="artwork-image-button"
        onClick={() => onOpen?.(artwork.id)}
        type="button"
      >
        <img
          alt={artwork.alt}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          src={artwork.src}
        />
        <span className="artwork-open" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M7 3H3V7M17 3H21V7M7 21H3V17M17 21H21V17" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
        <span className="artwork-caption" aria-hidden="true">
          <span>
            <strong>{artwork.title}</strong>
            <small>{artwork.year}</small>
          </span>
          <span className="artwork-caption-action">VER OBRA</span>
        </span>
      </button>
    </article>
  )
}
