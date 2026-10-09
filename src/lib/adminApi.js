import { supabase } from './supabase'

const REQUEST_TIMEOUT_MS = 12000

async function runWithTimeout(createQuery) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await createQuery(controller.signal)
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function isCurrentUserAdmin(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

export async function loadAdminData() {
  const [contentResult, artworksResult, postsResult] = await Promise.all([
    supabase.from('site_content').select('value').eq('id', 'main').single(),
    supabase.from('artworks').select('*').order('sort_order'),
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }),
  ])

  const firstError = contentResult.error || artworksResult.error || postsResult.error
  if (firstError) throw firstError

  return {
    content: contentResult.data.value,
    artworks: artworksResult.data,
    posts: postsResult.data,
  }
}

export async function saveSiteContent(value) {
  const { data, error } = await runWithTimeout((signal) =>
    supabase
      .from('site_content')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', 'main')
      .select('updated_at')
      .single()
      .abortSignal(signal),
  )
  if (error) throw error
  if (!data) throw new Error('No se confirmó la actualización del contenido')
}

export async function saveArtworkRecord(artwork) {
  const { error } = await supabase
    .from('artworks')
    .upsert({
      id: artwork.id,
      title: artwork.title,
      year: artwork.year,
      alt_text: artwork.alt_text,
      categories: artwork.categories,
      layout: artwork.layout,
      image_url: artwork.image_url,
      published: artwork.published ?? true,
      sort_order: artwork.sort_order,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  if (error) throw error
}

export async function deleteArtworkRecord(id) {
  const { error } = await supabase.from('artworks').delete().eq('id', id)
  if (error) throw error
}

export async function saveBlogPost(post) {
  const record = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    cover_url: post.cover_url,
    published: post.published,
    published_at: post.published_at,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('blog_posts').upsert(record)
  if (error) throw error
}

export async function uploadPortfolioImage(file, folder) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeFolder = folder.replace(/[^a-z0-9/-]/gi, '-')
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from('portfolio-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error
  return supabase.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl
}

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
