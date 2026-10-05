import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { artworks as fallbackArtworks } from '../data/artworks'
import { initialBlogPosts } from '../data/blogPosts'
import { defaultSiteContent } from '../data/siteContent'

const ContentContext = createContext(null)

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

    async function loadContent() {
      const { supabase } = await import('../lib/supabase')
      if (!supabase || ignore) return
      const [contentResult, artworksResult, postsResult] = await Promise.all([
        supabase.from('site_content').select('value').eq('id', 'main').maybeSingle(),
        supabase
          .from('artworks')
          .select('id,title,year,image_url,alt_text,categories,layout,sort_order')
          .eq('published', true)
          .order('sort_order'),
        supabase
          .from('blog_posts')
          .select('id,title,category,published_at,created_at,cover_url,excerpt,body')
          .eq('published', true)
          .order('published_at', { ascending: false }),
      ])

      if (ignore) return
      if (contentResult.data?.value) {
        setSiteContent((current) => ({ ...current, ...contentResult.data.value }))
      }
      if (artworksResult.data?.length) {
        setArtworks(artworksResult.data.map(normalizeArtwork))
      }
      if (postsResult.data?.length) {
        setBlogPosts(postsResult.data.map(normalizePost))
      }
    }

    loadContent()
    return () => {
      ignore = true
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
