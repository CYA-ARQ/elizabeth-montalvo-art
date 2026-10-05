import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../assetUrl'
import { initialBlogPosts } from '../data/blogPosts'
import { artworks as fallbackArtworks } from '../data/artworks'
import { defaultSiteContent } from '../data/siteContent'
import {
  isCurrentUserAdmin,
  loadAdminData,
  saveArtworkRecord,
  saveBlogPost,
  saveSiteContent,
  slugify,
  uploadPortfolioImage,
} from '../lib/adminApi'
import {
  getAdminEmail,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase'
import { Link } from '../router'

const previewMode = import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === '1'

const previewArtworks = fallbackArtworks.map((artwork, index) => ({
  id: artwork.id,
  title: artwork.title,
  year: artwork.year,
  image_url: artwork.src,
  alt_text: artwork.alt,
  categories: artwork.categories,
  layout: artwork.layout,
  published: true,
  sort_order: index,
}))

const previewPosts = initialBlogPosts.map((post) => ({
  ...post,
  slug: post.id,
  cover_url: post.cover,
  published: true,
  published_at: `${post.date}T12:00:00.000Z`,
}))

function AdminLogin({ message, onSubmit, submitting }) {
  return (
    <main className="admin-login">
      <div className="admin-login-panel">
        <div className="admin-login-brand">
          <img alt="Un Diseño con Marte" src={assetUrl('/brand/logo-elizabeth-montalvo-white.png')} />
          <span>Martha Montalvo</span>
        </div>
        <div className="admin-login-rule" />
        <h1>Acceso privado</h1>
        <p>Administración del portafolio</p>
        <form onSubmit={onSubmit}>
          <label>
            <span>USUARIO</span>
            <input autoComplete="username" name="username" required />
          </label>
          <label>
            <span>CONTRASEÑA</span>
            <input autoComplete="current-password" name="password" required type="password" />
          </label>
          <p aria-live="polite" className="admin-login-message">{message}</p>
          <button disabled={submitting || !isSupabaseConfigured} type="submit">
            {submitting ? 'VERIFICANDO…' : 'INGRESAR'}
          </button>
        </form>
        <Link className="admin-back-link" to="/">VOLVER AL SITIO</Link>
      </div>
      <img
        alt=""
        aria-hidden="true"
        className="admin-login-art"
        src={assetUrl('/hero/marea-cutout.png')}
      />
    </main>
  )
}

function SitePreview({ artwork, content }) {
  return (
    <aside className="admin-preview">
      <div className="admin-preview-heading">
        <h2>Vista previa del sitio</h2>
        <Link target="_blank" to="/">ABRIR WEB ↗</Link>
      </div>
      <div className="admin-preview-canvas">
        <header>
          <img alt="" src={assetUrl('/brand/logo-elizabeth-montalvo-white.png')} />
          <span>INICIO&nbsp;&nbsp;&nbsp; GALERÍA&nbsp;&nbsp;&nbsp; BLOG</span>
        </header>
        <div className="admin-preview-image">
          <img alt="" src={artwork?.image_url} />
          <div>
            <h3>{content.heroTitleLine1}<br />{content.heroTitleLine2}</h3>
            <p>{content.heroLead}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function AdminDashboard({ onSignOut }) {
  const [activeSection, setActiveSection] = useState('textos')
  const [content, setContent] = useState(defaultSiteContent)
  const [artworks, setArtworks] = useState(previewArtworks)
  const [posts, setPosts] = useState(previewPosts)
  const [artworkFiles, setArtworkFiles] = useState({})
  const [editingPost, setEditingPost] = useState(null)
  const [postCoverFile, setPostCoverFile] = useState(null)
  const [status, setStatus] = useState(previewMode ? 'Vista previa local' : 'Cargando contenido…')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (previewMode) return undefined
    let ignore = false

    loadAdminData()
      .then((data) => {
        if (ignore) return
        setContent((current) => ({ ...current, ...data.content }))
        setArtworks(data.artworks)
        setPosts(data.posts)
        setStatus('Cambios guardados')
      })
      .catch(() => {
        if (!ignore) setStatus('No fue posible cargar el contenido')
      })

    return () => {
      ignore = true
    }
  }, [])

  const featuredArtwork = artworks[0]
  const publishedPosts = useMemo(
    () => posts.filter((post) => post.published).length,
    [posts],
  )

  const updateArtwork = (id, field, value) => {
    setArtworks((current) =>
      current.map((artwork) =>
        artwork.id === id ? { ...artwork, [field]: value } : artwork,
      ),
    )
    setStatus('Cambios sin guardar')
  }

  const handleContentSave = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      if (!previewMode) await saveSiteContent(content)
      setStatus(previewMode ? 'Cambios aplicados en la vista previa' : 'Cambios guardados')
    } catch {
      setStatus('No fue posible guardar los textos')
    } finally {
      setBusy(false)
    }
  }

  const handleArtworkSave = async (artwork) => {
    setBusy(true)
    try {
      let imageUrl = artwork.image_url
      const file = artworkFiles[artwork.id]
      if (file && !previewMode) {
        imageUrl = await uploadPortfolioImage(file, `artworks/${artwork.id}`)
      }
      const nextArtwork = { ...artwork, image_url: imageUrl }
      if (!previewMode) await saveArtworkRecord(nextArtwork)
      setArtworks((current) =>
        current.map((item) => (item.id === artwork.id ? nextArtwork : item)),
      )
      setArtworkFiles((current) => ({ ...current, [artwork.id]: null }))
      setStatus(previewMode ? 'Obra actualizada en la vista previa' : 'Obra actualizada')
    } catch {
      setStatus('No fue posible actualizar la obra')
    } finally {
      setBusy(false)
    }
  }

  const startNewPost = () => {
    const now = new Date().toISOString()
    setEditingPost({
      id: crypto.randomUUID(),
      title: '',
      slug: '',
      category: 'Proceso',
      excerpt: '',
      body: '',
      cover_url: featuredArtwork?.image_url || '',
      published: true,
      published_at: now,
    })
    setPostCoverFile(null)
  }

  const handlePostSave = async (event) => {
    event.preventDefault()
    if (!editingPost.title.trim() || !editingPost.body.trim()) {
      setStatus('Completa el título y el contenido de la nota')
      return
    }

    setBusy(true)
    try {
      let coverUrl = editingPost.cover_url
      if (postCoverFile && !previewMode) {
        coverUrl = await uploadPortfolioImage(postCoverFile, 'blog')
      }
      const nextPost = {
        ...editingPost,
        slug: editingPost.slug || slugify(editingPost.title),
        excerpt:
          editingPost.excerpt ||
          `${editingPost.body.slice(0, 142).trim()}${editingPost.body.length > 142 ? '…' : ''}`,
        cover_url: coverUrl,
        published_at: editingPost.published
          ? editingPost.published_at || new Date().toISOString()
          : null,
      }
      if (!previewMode) await saveBlogPost(nextPost)
      setPosts((current) => {
        const exists = current.some((post) => post.id === nextPost.id)
        return exists
          ? current.map((post) => (post.id === nextPost.id ? nextPost : post))
          : [nextPost, ...current]
      })
      setEditingPost(null)
      setPostCoverFile(null)
      setStatus(previewMode ? 'Nota guardada en la vista previa' : 'Nota guardada')
    } catch {
      setStatus('No fue posible guardar la nota')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img alt="Un Diseño con Marte" src={assetUrl('/brand/logo-elizabeth-montalvo-white.png')} />
          <p>Martha Montalvo</p>
        </div>
        <nav aria-label="Secciones de administración">
          {[
            ['inicio', 'INICIO'],
            ['textos', 'TEXTOS'],
            ['galeria', 'GALERÍA'],
            ['blog', 'BLOG'],
          ].map(([id, label]) => (
            <button
              className={activeSection === id ? 'is-active' : ''}
              key={id}
              onClick={() => setActiveSection(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-actions">
          <Link target="_blank" to="/">VER WEB ↗</Link>
          <button onClick={onSignOut} type="button">CERRAR SESIÓN →</button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-workspace-header">
          <h1>Panel de Martha</h1>
          <p className={status.includes('No fue') ? 'is-error' : ''}>{status}</p>
        </header>

        <div className="admin-workspace-grid">
          <div className="admin-editor-column">
            {activeSection === 'inicio' ? (
              <section className="admin-overview">
                <h2>Gestiona tu web</h2>
                <p>Actualiza el contenido público desde un único espacio privado.</p>
                <button onClick={() => setActiveSection('textos')} type="button">
                  <span>01</span><strong>Editar textos</strong><i>Portada y Sobre mí →</i>
                </button>
                <button onClick={() => setActiveSection('galeria')} type="button">
                  <span>02</span><strong>Gestionar galería</strong><i>{artworks.length} obras →</i>
                </button>
                <button onClick={() => setActiveSection('blog')} type="button">
                  <span>03</span><strong>Notas del blog</strong><i>{publishedPosts} publicadas →</i>
                </button>
              </section>
            ) : null}

            {activeSection === 'textos' ? (
              <form className="admin-section" onSubmit={handleContentSave}>
                <h2>Textos del sitio</h2>
                <div className="admin-form-grid">
                  <label><span>TÍTULO PRINCIPAL — LÍNEA 1</span><input value={content.heroTitleLine1} onChange={(event) => setContent({ ...content, heroTitleLine1: event.target.value })} /></label>
                  <label><span>TÍTULO PRINCIPAL — LÍNEA 2</span><input value={content.heroTitleLine2} onChange={(event) => setContent({ ...content, heroTitleLine2: event.target.value })} /></label>
                  <label className="admin-field-wide"><span>DESCRIPCIÓN PRINCIPAL</span><textarea rows="3" value={content.heroLead} onChange={(event) => setContent({ ...content, heroLead: event.target.value })} /></label>
                  <label className="admin-field-wide"><span>INTRODUCCIÓN — SOBRE MÍ</span><textarea rows="2" value={content.aboutLead} onChange={(event) => setContent({ ...content, aboutLead: event.target.value })} /></label>
                  <label className="admin-field-wide"><span>BIOGRAFÍA — PÁRRAFO 1</span><textarea rows="5" value={content.aboutParagraphOne} onChange={(event) => setContent({ ...content, aboutParagraphOne: event.target.value })} /></label>
                  <label className="admin-field-wide"><span>BIOGRAFÍA — PÁRRAFO 2</span><textarea rows="5" value={content.aboutParagraphTwo} onChange={(event) => setContent({ ...content, aboutParagraphTwo: event.target.value })} /></label>
                </div>
                <button className="admin-primary-button" disabled={busy} type="submit">GUARDAR CAMBIOS</button>
              </form>
            ) : null}

            {activeSection === 'galeria' ? (
              <section className="admin-section">
                <h2>Galería</h2>
                <div className="admin-artwork-grid">
                  {artworks.map((artwork) => (
                    <article className="admin-artwork" key={artwork.id}>
                      <img alt={artwork.alt_text} src={artwork.preview_url || artwork.image_url} />
                      <label><span>TÍTULO</span><input value={artwork.title} onChange={(event) => updateArtwork(artwork.id, 'title', event.target.value)} /></label>
                      <div>
                        <label><span>AÑO</span><input value={artwork.year} onChange={(event) => updateArtwork(artwork.id, 'year', event.target.value)} /></label>
                        <label><span>FORMATO</span><select value={artwork.layout} onChange={(event) => updateArtwork(artwork.id, 'layout', event.target.value)}><option value="portrait">Vertical</option><option value="wide">Horizontal</option><option value="square">Cuadrado</option></select></label>
                      </div>
                      <label><span>TEXTO ALTERNATIVO</span><input value={artwork.alt_text} onChange={(event) => updateArtwork(artwork.id, 'alt_text', event.target.value)} /></label>
                      <div className="admin-artwork-actions">
                        <label className="admin-file-button">REEMPLAZAR IMAGEN<input accept="image/jpeg,image/png,image/webp" type="file" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setArtworkFiles((current) => ({ ...current, [artwork.id]: file })); updateArtwork(artwork.id, 'preview_url', URL.createObjectURL(file)) }} /></label>
                        <button disabled={busy} onClick={() => handleArtworkSave(artwork)} type="button">GUARDAR</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === 'blog' ? (
              <section className="admin-section">
                <div className="admin-section-heading"><h2>Notas del blog</h2><button className="admin-primary-button" onClick={startNewPost} type="button">NUEVA NOTA</button></div>
                {editingPost ? (
                  <form className="admin-blog-form" onSubmit={handlePostSave}>
                    <label><span>TÍTULO</span><input value={editingPost.title} onChange={(event) => setEditingPost({ ...editingPost, title: event.target.value })} /></label>
                    <label><span>CATEGORÍA</span><select value={editingPost.category} onChange={(event) => setEditingPost({ ...editingPost, category: event.target.value })}><option>Proceso</option><option>Reflexiones</option><option>Cuaderno</option><option>Memoria</option></select></label>
                    <label><span>RESUMEN</span><textarea rows="3" value={editingPost.excerpt || ''} onChange={(event) => setEditingPost({ ...editingPost, excerpt: event.target.value })} /></label>
                    <label><span>CONTENIDO</span><textarea rows="10" value={editingPost.body} onChange={(event) => setEditingPost({ ...editingPost, body: event.target.value })} /></label>
                    <label className="admin-file-button">CAMBIAR PORTADA<input accept="image/jpeg,image/png,image/webp" type="file" onChange={(event) => setPostCoverFile(event.target.files?.[0] || null)} /></label>
                    <label className="admin-publish-check"><input checked={editingPost.published} onChange={(event) => setEditingPost({ ...editingPost, published: event.target.checked })} type="checkbox" /> PUBLICAR NOTA</label>
                    <div><button className="admin-primary-button" disabled={busy} type="submit">GUARDAR NOTA</button><button className="admin-secondary-button" onClick={() => setEditingPost(null)} type="button">CANCELAR</button></div>
                  </form>
                ) : null}
                <div className="admin-post-list">
                  {posts.map((post) => (
                    <article key={post.id}>
                      <img alt="" src={post.cover_url} />
                      <div><h3>{post.title}</h3><p>{post.category}</p></div>
                      <span className={post.published ? 'is-published' : ''}>{post.published ? 'PUBLICADA' : 'BORRADOR'}</span>
                      <button onClick={() => { setEditingPost(post); setPostCoverFile(null) }} type="button">EDITAR</button>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <SitePreview artwork={featuredArtwork} content={content} />
        </div>
      </section>
    </main>
  )
}

export default function AdminPage() {
  const [authState, setAuthState] = useState(previewMode ? 'authorized' : 'loading')
  const [message, setMessage] = useState(
    isSupabaseConfigured ? '' : 'El acceso seguro todavía necesita conectarse al servidor.',
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase || previewMode) return undefined
    let ignore = false

    const verifySession = async (session) => {
      if (!session?.user) {
        if (!ignore) setAuthState('signedOut')
        return
      }
      try {
        const authorized = await isCurrentUserAdmin(session.user.id)
        if (!ignore) setAuthState(authorized ? 'authorized' : 'signedOut')
        if (!authorized) await supabase.auth.signOut()
      } catch {
        if (!ignore) {
          setAuthState('signedOut')
          setMessage('No fue posible verificar el acceso.')
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => verifySession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => verifySession(session))
    return () => {
      ignore = true
      data.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = getAdminEmail(String(form.get('username')))
    if (!email) {
      setMessage('Usuario o contraseña incorrectos.')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: String(form.get('password')),
      })
      const authorized = !error && data.user && (await isCurrentUserAdmin(data.user.id))
      if (!authorized) {
        await supabase.auth.signOut()
        setMessage('Usuario o contraseña incorrectos.')
        setAuthState('signedOut')
      } else {
        setAuthState('authorized')
      }
    } catch {
      await supabase.auth.signOut()
      setMessage('Usuario o contraseña incorrectos.')
      setAuthState('signedOut')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    if (!previewMode) await supabase.auth.signOut()
    setAuthState('signedOut')
  }

  if (authState === 'loading') {
    return <main className="admin-loading">Verificando acceso seguro…</main>
  }

  if (authState !== 'authorized') {
    return <AdminLogin message={message} onSubmit={handleLogin} submitting={submitting} />
  }

  return <AdminDashboard onSignOut={handleSignOut} />
}
