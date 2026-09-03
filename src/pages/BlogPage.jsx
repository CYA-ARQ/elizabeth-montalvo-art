import { useEffect, useRef, useState } from 'react'
import ArrowIcon from '../components/ArrowIcon'
import { BLOG_STORAGE_KEY, initialBlogPosts } from '../data/blogPosts'

const MAX_IMAGE_SIZE = 1_500_000

function formatDate(date) {
  const [year, month, day] = date.split('-')
  return `${day} / ${month} / ${year}`
}

function loadPosts() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(BLOG_STORAGE_KEY))
    return stored?.version === 1 && Array.isArray(stored.posts)
      ? stored.posts
      : initialBlogPosts
  } catch {
    return initialBlogPosts
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState(loadPosts)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [pageMessage, setPageMessage] = useState('')
  const [deleteArmed, setDeleteArmed] = useState(false)
  const titleInputRef = useRef(null)
  const newNoteButtonRef = useRef(null)
  const panelOpen = editorOpen || Boolean(selectedPost)
  const selectedPostIsLocal =
    selectedPost && !initialBlogPosts.some((post) => post.id === selectedPost.id)

  useEffect(() => {
    if (!panelOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setEditorOpen(false)
        setSelectedPost(null)
      }
    }

    document.body.classList.add('panel-is-open')
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.classList.remove('panel-is-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [panelOpen])

  useEffect(() => {
    if (editorOpen) titleInputRef.current?.focus()
  }, [editorOpen])

  const openEditor = () => {
    setSelectedPost(null)
    setFormMessage('')
    setCoverPreview('')
    setDeleteArmed(false)
    setEditorOpen(true)
  }

  const closePanel = () => {
    setEditorOpen(false)
    setSelectedPost(null)
    setDeleteArmed(false)
    window.requestAnimationFrame(() => newNoteButtonRef.current?.focus())
  }

  const handleCoverChange = (event) => {
    const [file] = event.target.files
    setFormMessage('')

    if (!file) {
      setCoverPreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setFormMessage('Selecciona un archivo de imagen válido.')
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFormMessage('La imagen debe pesar menos de 1,5 MB.')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => setCoverPreview(String(reader.result)))
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title')).trim()
    const category = String(form.get('category')).trim()
    const body = String(form.get('body')).trim()

    if (!title || !category || !body) {
      setFormMessage('Completa el título, la categoría y la memoria.')
      return
    }

    const nextPost = {
      id: globalThis.crypto?.randomUUID?.() ?? `nota-${Date.now()}`,
      title,
      category,
      date: new Date().toISOString().slice(0, 10),
      cover: coverPreview || '/artworks/marea-interior.png',
      excerpt: body.length > 145 ? `${body.slice(0, 142).trim()}…` : body,
      body,
    }
    const nextPosts = [nextPost, ...posts]

    try {
      window.localStorage.setItem(
        BLOG_STORAGE_KEY,
        JSON.stringify({ version: 1, posts: nextPosts }),
      )
      setPosts(nextPosts)
      setPageMessage('La nota se guardó en este navegador.')
      setEditorOpen(false)
      setCoverPreview('')
    } catch {
      setFormMessage('No fue posible guardar la nota. Prueba con una imagen más ligera.')
    }
  }

  const handleDelete = () => {
    if (!deleteArmed) {
      setDeleteArmed(true)
      return
    }

    const nextPosts = posts.filter((post) => post.id !== selectedPost.id)

    try {
      window.localStorage.setItem(
        BLOG_STORAGE_KEY,
        JSON.stringify({ version: 1, posts: nextPosts }),
      )
      setPosts(nextPosts)
      setSelectedPost(null)
      setDeleteArmed(false)
      setPageMessage('La nota local se eliminó correctamente.')
    } catch {
      setPageMessage('No fue posible eliminar la nota.')
    }
  }

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
          <button
            className="blog-new-button"
            onClick={openEditor}
            ref={newNoteButtonRef}
            type="button"
          >
            NUEVA NOTA <ArrowIcon />
          </button>
        </header>

        <p aria-live="polite" className={`blog-page-status ${pageMessage ? 'is-visible' : ''}`}>
          {pageMessage}
        </p>

        <div className="blog-list">
          {posts.map((post, index) => (
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
                  onClick={() => {
                    setDeleteArmed(false)
                    setSelectedPost(post)
                  }}
                  type="button"
                >
                  LEER NOTA <ArrowIcon />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {panelOpen ? (
        <div className="blog-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closePanel()
        }}>
          <section
            aria-labelledby={editorOpen ? 'editor-title' : 'reader-title'}
            aria-modal="true"
            className={`blog-drawer ${selectedPost ? 'blog-drawer--reader' : ''}`}
            role="dialog"
          >
            <button
              aria-label="Cerrar panel"
              className="drawer-close"
              onClick={closePanel}
              type="button"
            >
              <span />
              <span />
            </button>

            {editorOpen ? (
              <form className="blog-editor" onSubmit={handleSubmit}>
                <h2 id="editor-title">Nueva nota</h2>
                <label>
                  <span>TÍTULO</span>
                  <input autoComplete="off" name="title" ref={titleInputRef} />
                </label>
                <label>
                  <span>CATEGORÍA</span>
                  <select defaultValue="Proceso" name="category">
                    <option>Proceso</option>
                    <option>Reflexiones</option>
                    <option>Cuaderno</option>
                    <option>Memoria</option>
                  </select>
                </label>
                <label>
                  <span>MEMORIA</span>
                  <textarea name="body" rows="9" />
                </label>
                <div className="editor-cover-field">
                  <span>IMAGEN DE PORTADA</span>
                  <label className={`cover-picker ${coverPreview ? 'has-preview' : ''}`}>
                    {coverPreview ? (
                      <img alt="Vista previa de la portada" src={coverPreview} />
                    ) : (
                      <>
                        <svg aria-hidden="true" viewBox="0 0 40 40">
                          <rect height="29" width="34" x="3" y="6" />
                          <circle cx="28" cy="15" r="3" />
                          <path d="m7 31 9-10 7 7 4-4 9 8" />
                        </svg>
                        <span>Seleccionar imagen</span>
                      </>
                    )}
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      name="cover"
                      onChange={handleCoverChange}
                      type="file"
                    />
                  </label>
                </div>
                <p aria-live="polite" className="blog-form-message">{formMessage}</p>
                <button className="blog-save-button" type="submit">
                  GUARDAR NOTA
                </button>
                <button className="blog-cancel-button" onClick={closePanel} type="button">
                  CANCELAR
                </button>
              </form>
            ) : (
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
                {selectedPostIsLocal ? (
                  <button
                    className={`blog-delete-button ${deleteArmed ? 'is-armed' : ''}`}
                    onClick={handleDelete}
                    type="button"
                  >
                    {deleteArmed ? 'CONFIRMAR ELIMINACIÓN' : 'ELIMINAR NOTA LOCAL'}
                  </button>
                ) : null}
              </article>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}
