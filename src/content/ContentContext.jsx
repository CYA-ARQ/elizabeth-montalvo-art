import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { artworks as fallbackArtworks } from '../data/artworks'
import { initialBlogPosts } from '../data/blogPosts'
import { defaultSiteContent } from '../data/siteContent'

const ContentContext = createContext(null)
const CONTENT_REFRESH_KEY = 'martha-portfolio:content-refresh'
const CONTENT_REFRESH_EVENT = 'portfolio-content-refresh'
const CONTENT_REQUEST_TIMEOUT_MS = 12000

export function announceContentRefresh() {
  const refreshedAt = String(Date.now())
  window.localStorage.setItem(CONTENT_REFRESH_KEY, refreshedAt)
  window.dispatchEvent(new CustomEvent(CONTENT_REFRESH_EVENT))
}

function normalizeArtwork(row) {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    src: row.image_url,
    alt: row.alt_text,
    categories: row.categories,
    layout: row.layout,
  }
}

function normalizePost(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.published_at?.slice(0, 10) || row.created_at.slice(0, 10),
    cover: row.cover_url,
    excerpt: row.excerpt,
    body: row.body,
  }
}

export function ContentProvider({ children }) {
  const [siteContent, setSiteContent] = useState(defaultSiteContent)
  const [artworks, setArtworks] = useState(fallbackArtworks)
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts)

  useEffect(() => {
    let ignore = false
    let activeController = null

    async function loadContent() {
      activeController?.abort()
      const controller = new AbortController()
      activeController = controller
      const timeout = window.setTimeout(
        () => controller.abort(),
        CONTENT_REQUEST_TIMEOUT_MS,
      )

      try {
        const { supabase } = await import('../lib/supabase')
        if (!supabase || ignore) return

        const [contentResult, artworksResult, postsResult] = await Promise.all([
          supabase
            .from('site_content')
            .select('value')
            .eq('id', 'main')
            .maybeSingle()
            .abortSignal(controller.signal),
          supabase
            .from('artworks')
            .select('id,title,year,image_url,alt_text,categories,layout,sort_order')
            .eq('published', true)
            .order('sort_order')
            .abortSignal(controller.signal),
          supabase
            .from('blog_posts')
            .select('id,title,category,published_at,created_at,cover_url,excerpt,body')
            .eq('published', true)
            .order('published_at', { ascending: false })
            .abortSignal(controller.signal),
        ])

        if (ignore || controller.signal.aborted) return
        if (!contentResult.error && contentResult.data?.value) {
          setSiteContent((current) => ({ ...current, ...contentResult.data.value }))
        }
        if (!artworksResult.error && artworksResult.data?.length) {
          setArtworks(artworksResult.data.map(normalizeArtwork))
        }
        if (!postsResult.error && postsResult.data?.length) {
          setBlogPosts(postsResult.data.map(normalizePost))
        }
      } catch {
        // Keep the bundled content visible if the remote source is unavailable.
        return
      } finally {
        window.clearTimeout(timeout)
      }
    }

    loadContent()
    const handleContentRefresh = () => loadContent()
    const handleStorage = (event) => {
      if (event.key === CONTENT_REFRESH_KEY) loadContent()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadContent()
    }

    window.addEventListener(CONTENT_REFRESH_EVENT, handleContentRefresh)
    window.addEventListener('storage', handleStorage)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      ignore = true
      activeController?.abort()
      window.removeEventListener(CONTENT_REFRESH_EVENT, handleContentRefresh)
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const value = useMemo(
    () => ({ artworks, blogPosts, siteContent }),
    [artworks, blogPosts, siteContent],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useSiteContent() {
  const context = useContext(ContentContext)
  if (!context) throw new Error('useSiteContent must be used inside ContentProvider')
  return context
}
