import { useMemo, useState } from 'react'
import ArtworkCard from '../components/ArtworkCard'
import Lightbox from '../components/Lightbox'
import { artworks, galleryFilters } from '../data/artworks'

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('Todas')
  const [activeArtworkId, setActiveArtworkId] = useState(null)

  const filteredArtworks = useMemo(
    () =>
      activeFilter === 'Todas'
        ? artworks
        : artworks.filter((artwork) => artwork.categories.includes(activeFilter)),
    [activeFilter],
  )

  const galleryColumns = useMemo(
    () =>
      Array.from({ length: 3 }, (_, columnIndex) =>
        filteredArtworks.filter((_, index) => index % 3 === columnIndex),
      ),
    [filteredArtworks],
  )

  return (
    <>
      <section className="gallery-page section-pad">
        <div className="gallery-toolbar reveal">
          <h1>
            <span>Obras</span>
            <small>/ 2024—2026</small>
          </h1>

          <div className="gallery-filters" aria-label="Filtrar obras">
            {galleryFilters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? 'active' : undefined}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid reveal reveal--delay" aria-live="polite">
          {galleryColumns.map((column, columnIndex) => (
            <div className="gallery-column" key={columnIndex}>
              {column.map((artwork, index) => (
                <ArtworkCard
                  artwork={artwork}
                  key={artwork.id}
                  onOpen={setActiveArtworkId}
                  priority={index === 0}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <Lightbox
        activeId={activeArtworkId}
        artworks={filteredArtworks}
        onChange={setActiveArtworkId}
        onClose={() => setActiveArtworkId(null)}
      />
    </>
  )
}
