import { useEffect, useState } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import { useSiteContent } from '../content/ContentContext'

function formatDate(date) {
  const [year, month, day] = date.split('-')
  return `${day} / ${month} / ${year}`
}

export default function BlogPage() {
  const { blogPosts } = useSiteContent()
  const [selectedPost, setSelectedPost] = useState(null)

  useEffect(() => {
    if (!selectedPost) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedPost(null)
    }

    document.body.classList.add('panel-is-open')
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('panel-is-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPost])

  return (
    <>
      <section className="blog-page">
        <header className="blog-intro reveal">
          <div>
            <h1>Notas &amp; memorias</h1>
            <p>
              Un archivo íntimo de procesos, hallazgos y escenas que acompañan la
              obra.
            </p>
          </div>
        </header>

        <div className="blog-list">
          {blogPosts.map((post, index) => (
            <article
              className={`blog-entry ${index === 0 ? 'blog-entry--featured' : ''}`}
              key={post.id}
            >
              <div className="blog-entry-media">
                <img alt={`Portada de ${post.title}`} src={post.cover} />
              </div>
              <div className="blog-entry-main">
                <p className="blog-meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <i aria-hidden="true" />
                  <span>{post.category}</span>
                </p>
                <h2>{post.title}</h2>
              </div>
              <div className="blog-entry-summary">
                <p>{post.excerpt}</p>
                <button
                  className="blog-read-button"
                  onClick={() => setSelectedPost(post)}
                  type="button"
                >
                  LEER NOTA <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedPost ? (
        <div
          className="blog-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedPost(null)
          }}
        >
          <section
            aria-labelledby="reader-title"
            aria-modal="true"
            className="blog-drawer blog-drawer--reader"
            role="dialog"
          >
            <button
              aria-label="Cerrar panel"
              className="drawer-close"
              onClick={() => setSelectedPost(null)}
              type="button"
            >
              <span />
              <span />
            </button>

            <article className="blog-reader">
              <p className="blog-meta">
                <time dateTime={selectedPost.date}>{formatDate(selectedPost.date)}</time>
                <i aria-hidden="true" />
                <span>{selectedPost.category}</span>
              </p>
              <h2 id="reader-title">{selectedPost.title}</h2>
              <img alt={`Portada de ${selectedPost.title}`} src={selectedPost.cover} />
              <div>
                {selectedPost.body.split('\n\n').map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </>
  )
}
