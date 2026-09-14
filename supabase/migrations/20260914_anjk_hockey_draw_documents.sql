-- Apply after the flexible-knockout migration. Official documents never alter fixtures.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anjk-tournament-documents', 'anjk-tournament-documents', false, 26214400,
  array['application/pdf','image/jpeg','image/png','image/webp',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

create table public.hockey_tournament_documents (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.hockey_seasons(id) on delete cascade,
  document_type text not null default 'DrawTies' check (document_type ~ '^[A-Za-z][A-Za-z0-9]{0,39}$'),
  title text not null check (length(trim(title)) between 1 and 200),
  description text not null default '' check (length(description) <= 2000),
  storage_path text not null unique,
  original_file_name text not null check (length(original_file_name) between 1 and 255),
  mime_type text not null,
  file_extension text not null,
  file_size bigint not null check (file_size between 1 and 26214400),
  version_number integer not null check (version_number > 0),
  is_published boolean not null default false,
  is_current boolean not null default false,
  ever_published boolean not null default false,
  effective_date date,
  revision_note text not null default '' check (length(revision_note) <= 1000),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (season_id, document_type, version_number),
  constraint hockey_doc_publication check (
    (not is_current or is_published) and (not is_published or ever_published) and
    (not ever_published or published_at is not null)),
  constraint hockey_doc_extension_mime check (
    (file_extension='pdf' and mime_type='application/pdf') or
    (file_extension in ('jpg','jpeg') and mime_type='image/jpeg') or
    (file_extension='png' and mime_type='image/png') or
    (file_extension='webp' and mime_type='image/webp') or
    (file_extension='xls' and mime_type='application/vnd.ms-excel') or
    (file_extension='xlsx' and mime_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') or
    (file_extension='csv' and mime_type='text/csv') or
    (file_extension='doc' and mime_type='application/msword') or
    (file_extension='docx' and mime_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document') or
    (file_extension='ppt' and mime_type='application/vnd.ms-powerpoint') or
    (file_extension='pptx' and mime_type='application/vnd.openxmlformats-officedocument.presentationml.presentation') or
    (file_extension='txt' and mime_type='text/plain')),
  constraint hockey_doc_storage_path check (
    storage_path = season_id::text || '/draw-ties/' || id::text || '/' || id::text || '.' || file_extension)
);
create unique index hockey_one_current_document on public.hockey_tournament_documents(season_id,document_type) where is_current;
create index hockey_document_history on public.hockey_tournament_documents(season_id,document_type,is_published,version_number desc);

create function public.hockey_guard_document() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  if tg_op='INSERT' then
    if new.is_published or new.is_current or new.ever_published or new.published_at is not null then
      raise exception 'New document must begin as a draft'; end if;
    perform 1 from public.hockey_seasons where id=new.season_id for update;
    new.version_number := coalesce((select max(version_number)+1 from public.hockey_tournament_documents
      where season_id=new.season_id and document_type=new.document_type),1);
    new.created_by := auth.uid();
  else
    if (new.id,new.season_id,new.document_type,new.storage_path,new.original_file_name,
      new.mime_type,new.file_extension,new.file_size,new.version_number,new.created_by,new.created_at)
      is distinct from
      (old.id,old.season_id,old.document_type,old.storage_path,old.original_file_name,
       old.mime_type,old.file_extension,old.file_size,old.version_number,old.created_by,old.created_at) then
      raise exception 'A revision cannot replace its file or version'; end if;
    if old.ever_published and not new.ever_published then raise exception 'Publication history cannot be cleared'; end if;
    if old.published_at is not null and new.published_at is distinct from old.published_at then
      raise exception 'Original publication date cannot change'; end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger hockey_document_guard before insert or update on public.hockey_tournament_documents
  for each row execute function public.hockey_guard_document();
create function public.hockey_prevent_published_document_delete() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  if old.ever_published then raise exception 'Published official revisions remain in history; unpublish instead'; end if;
  return old;
end $$;
create trigger hockey_document_delete_guard before delete on public.hockey_tournament_documents
  for each row execute function public.hockey_prevent_published_document_delete();

alter table public.hockey_tournament_documents enable row level security;
create policy "published or admin hockey documents" on public.hockey_tournament_documents for select
  using (is_published or public.is_admin());
create policy "admin create draft hockey document" on public.hockey_tournament_documents for insert to authenticated
  with check (public.is_admin() and not is_published and not ever_published);
create policy "admin edit hockey document metadata" on public.hockey_tournament_documents for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin delete never-published draft" on public.hockey_tournament_documents for delete to authenticated
  using (public.is_admin() and not ever_published);
grant select on public.hockey_tournament_documents to anon,authenticated;
grant insert,delete on public.hockey_tournament_documents to authenticated;
grant update (title,description,effective_date,revision_note) on public.hockey_tournament_documents to authenticated;

-- Only the authenticated admin function changes publication flags, atomically selecting a fallback.
create function public.hockey_set_document_publication(p_document_id uuid,p_publish boolean)
returns public.hockey_tournament_documents language plpgsql security definer set search_path=public,pg_temp as $$
declare d public.hockey_tournament_documents; prior_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into d from public.hockey_tournament_documents where id=p_document_id;
  if not found then raise exception 'Document not found'; end if;
  perform 1 from public.hockey_seasons where id=d.season_id for update;
  select * into d from public.hockey_tournament_documents where id=p_document_id for update;
  if p_publish then
    if not exists (select 1 from storage.objects where bucket_id='anjk-tournament-documents' and name=d.storage_path) then
      raise exception 'Upload the file before publishing'; end if;
    update public.hockey_tournament_documents set is_current=false
      where season_id=d.season_id and document_type=d.document_type and is_current and id<>d.id;
    update public.hockey_tournament_documents set is_published=true,is_current=true,ever_published=true,
      published_at=coalesce(published_at,now()) where id=d.id returning * into d;
  else
    update public.hockey_tournament_documents set is_published=false,is_current=false
      where id=d.id returning * into d;
    if not exists (select 1 from public.hockey_tournament_documents
      where season_id=d.season_id and document_type=d.document_type and is_current) then
      select id into prior_id from public.hockey_tournament_documents
        where season_id=d.season_id and document_type=d.document_type and is_published
        order by version_number desc limit 1;
      if prior_id is not null then
        update public.hockey_tournament_documents set is_current=true where id=prior_id;
      end if;
    end if;
  end if;
  return d;
end $$;
revoke all on function public.hockey_set_document_publication(uuid,boolean) from public,anon;
grant execute on function public.hockey_set_document_publication(uuid,boolean) to authenticated;

create policy "published hockey document object or admin" on storage.objects for select to anon,authenticated
  using (bucket_id='anjk-tournament-documents' and (
    public.is_admin() or exists (select 1 from public.hockey_tournament_documents d
      where d.storage_path=name and d.is_published)));
create policy "admin upload hockey document" on storage.objects for insert to authenticated
  with check (bucket_id='anjk-tournament-documents' and public.is_admin() and
    name ~ '^[0-9a-f-]{36}/draw-ties/[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpe?g|png|webp|xls|xlsx|csv|doc|docx|ppt|pptx|txt)$');
create policy "admin remove draft or orphan hockey object" on storage.objects for delete to authenticated
  using (bucket_id='anjk-tournament-documents' and public.is_admin() and
    not exists (select 1 from public.hockey_tournament_documents d
      where d.storage_path=name and d.ever_published));

notify pgrst,'reload schema';
commit;
