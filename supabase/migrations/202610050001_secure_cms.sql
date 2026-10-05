create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.artworks (
  id text primary key,
  title text not null check (char_length(title) between 1 and 120),
  year text not null check (char_length(year) between 1 and 12),
  image_url text not null,
  alt_text text not null default '',
  categories text[] not null default '{}',
  layout text not null default 'portrait' check (layout in ('portrait', 'wide', 'square')),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 180),
  category text not null check (char_length(category) between 1 and 60),
  excerpt text not null default '',
  body text not null,
  cover_url text not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artworks_published_sort_idx
  on public.artworks (published, sort_order);
create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published, published_at desc);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;
alter table public.artworks enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists admin_users_read_self on public.admin_users;
create policy admin_users_read_self on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  for select to anon, authenticated using (true);
drop policy if exists site_content_admin_insert on public.site_content;
create policy site_content_admin_insert on public.site_content
  for insert to authenticated with check ((select public.is_portfolio_admin()));
drop policy if exists site_content_admin_update on public.site_content;
create policy site_content_admin_update on public.site_content
  for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

drop policy if exists artworks_public_read on public.artworks;
create policy artworks_public_read on public.artworks
  for select to anon, authenticated
  using (published or (select public.is_portfolio_admin()));
drop policy if exists artworks_admin_insert on public.artworks;
create policy artworks_admin_insert on public.artworks
  for insert to authenticated with check ((select public.is_portfolio_admin()));
drop policy if exists artworks_admin_update on public.artworks;
create policy artworks_admin_update on public.artworks
  for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
  for select to anon, authenticated
  using (published or (select public.is_portfolio_admin()));
drop policy if exists blog_posts_admin_insert on public.blog_posts;
create policy blog_posts_admin_insert on public.blog_posts
  for insert to authenticated with check ((select public.is_portfolio_admin()));
drop policy if exists blog_posts_admin_update on public.blog_posts;
create policy blog_posts_admin_update on public.blog_posts
  for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.site_content, public.artworks, public.blog_posts to anon, authenticated;
grant insert, update on public.site_content, public.artworks, public.blog_posts to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists portfolio_media_public_read on storage.objects;
create policy portfolio_media_public_read on storage.objects
  for select to public using (bucket_id = 'portfolio-media');
drop policy if exists portfolio_media_admin_insert on storage.objects;
create policy portfolio_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists portfolio_media_admin_update on storage.objects;
create policy portfolio_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()))
  with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

insert into public.site_content (id, value)
values (
  'main',
  jsonb_build_object(
    'heroTitleLine1', 'La pintura como expresión',
    'heroTitleLine2', 'más allá de las palabras.',
    'heroLead', 'Cuerpo, memoria, inconsciente y naturaleza en obras que transmiten lo íntimo.',
    'aboutLead', 'Pinto para escuchar lo que las palabras no alcanzan.',
    'aboutParagraphOne', 'Soy Martha Montalvo. Mi práctica artística nace de la observación atenta de la vida cotidiana, la memoria y la naturaleza. Me interesa lo que permanece en silencio: gestos mínimos, miradas, texturas y luces que cambian sin avisar.',
    'aboutParagraphTwo', 'Trabajo la figura humana y el paisaje como territorios emocionales. El cuerpo, en toda su fragilidad y fuerza, es un lugar donde se cruzan lo personal y lo universal. Pinto para comprender, acompañar y recordar lo esencial.',
    'practiceLine', 'Pintura figurativa · Técnica mixta'
  )
)
on conflict (id) do nothing;

insert into public.artworks
  (id, title, year, image_url, alt_text, categories, layout, sort_order)
values
  ('el-origen', 'El origen', '2026', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/el-origen.png', 'Pavo real que protege una vida en gestación entre sus plumas', array['Figuración', 'Naturaleza'], 'portrait', 1),
  ('el-vuelo', 'El vuelo', '2026', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/el-vuelo.png', 'Niños en un campo alrededor de una gran cometa azul', array['Memoria', 'Figuración'], 'wide', 2),
  ('ritual', 'Ritual', '2026', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/ritual.png', 'Retrato enmarcado de un hombre con un habano', array['Figuración', 'Memoria'], 'square', 3),
  ('marea-interior', 'Marea interior', '2026', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/marea-interior.png', 'Perfil de una mujer iluminada por tonos cálidos frente a una marea azul', array['Figuración', 'Naturaleza'], 'portrait', 4)
on conflict (id) do nothing;

insert into public.blog_posts
  (id, slug, title, category, excerpt, body, cover_url, published, published_at)
values
  ('la-memoria-del-agua', 'la-memoria-del-agua', 'La memoria del agua', 'Proceso', 'El agua no solo fluye: recuerda. En esta serie se vuelve testigo, piel y archivo de lo que fuimos.', E'El agua no solo fluye: recuerda. En esta serie se vuelve testigo, piel y archivo de lo que fuimos.\n\nPintar sus reflejos es volver a una memoria que nunca permanece quieta. Cada capa de azul guarda una pausa, una pérdida y también una forma de regreso.', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/marea-interior.png', true, '2026-05-18T12:00:00Z'),
  ('apuntes-sobre-el-color', 'apuntes-sobre-el-color', 'Apuntes sobre el color', 'Reflexiones', 'Pensamientos sueltos sobre cómo el color transforma la forma, el ánimo y la memoria.', E'El color llega antes que la explicación. A veces una obra comienza con un amarillo que insiste o con un violeta que pide silencio.\n\nMe interesa seguir esa primera intuición y dejar que la paleta descubra el tono emocional de la escena.', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/el-origen.png', true, '2026-04-02T12:00:00Z'),
  ('lo-que-queda-en-el-papel', 'lo-que-queda-en-el-papel', 'Lo que queda en el papel', 'Cuaderno', 'Dibujos, palabras y manchas: el papel como territorio de juego y de preguntas sin respuesta.', E'El cuaderno recibe lo que todavía no tiene nombre. Dibujos, palabras y manchas conviven como fragmentos de una conversación privada.\n\nNo todo apunte se convierte en pintura, pero todos dejan una huella en la manera de mirar.', 'https://cya-arq.github.io/elizabeth-montalvo-art/artworks/el-vuelo.png', true, '2026-02-12T12:00:00Z')
on conflict (id) do nothing;
