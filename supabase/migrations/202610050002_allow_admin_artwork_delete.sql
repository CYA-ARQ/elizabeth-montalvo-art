drop policy if exists artworks_admin_delete on public.artworks;
create policy artworks_admin_delete on public.artworks
  for delete to authenticated
  using ((select public.is_portfolio_admin()));

grant delete on public.artworks to authenticated;
