-- Run as database owner after the draw-documents migration. Everything rolls back.
begin;
create or replace function public.is_admin() returns boolean language sql stable as $$
  select current_setting('role') <> 'anon'
$$;
do $$
declare s uuid; d1 uuid:=gen_random_uuid(); d2 uuid:=gen_random_uuid(); draft uuid:=gen_random_uuid();
  p1 text; p2 text; pd text; result public.hockey_tournament_documents; refused boolean;
begin
  insert into public.hockey_seasons(slug,name) values('draw-test-'||substr(gen_random_uuid()::text,1,8),'Draw test') returning id into s;
  p1:=s::text||'/draw-ties/'||d1::text||'/'||d1::text||'.pdf';
  p2:=s::text||'/draw-ties/'||d2::text||'/'||d2::text||'.xlsx';
  pd:=s::text||'/draw-ties/'||draft::text||'/'||draft::text||'.png';
  insert into public.hockey_tournament_documents(id,season_id,title,storage_path,original_file_name,
    mime_type,file_extension,file_size,version_number)
    values(d1,s,'Initial',p1,'initial.pdf','application/pdf','pdf',100,999);
  if (select version_number from public.hockey_tournament_documents where id=d1)<>1 then raise exception 'Version 1 not allocated'; end if;
  insert into storage.objects(bucket_id,name) values('anjk-tournament-documents',p1);
  result:=public.hockey_set_document_publication(d1,true);
  if not result.is_current or not result.is_published then raise exception 'Initial publication failed'; end if;
  insert into public.hockey_tournament_documents(id,season_id,title,storage_path,original_file_name,
    mime_type,file_extension,file_size,version_number,revision_note)
    values(d2,s,'Revised',p2,'revised.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','xlsx',200,999,'Tie 18 changed');
  insert into storage.objects(bucket_id,name) values('anjk-tournament-documents',p2);
  if (select version_number from public.hockey_tournament_documents where id=d2)<>2 then raise exception 'Version 2 not allocated'; end if;
  result:=public.hockey_set_document_publication(d2,true);
  if not result.is_current or (select is_current from public.hockey_tournament_documents where id=d1) then
    raise exception 'Latest publication did not switch current version'; end if;
  if (select storage_path from public.hockey_tournament_documents where id=d1)<>p1 then
    raise exception 'Old published file was overwritten'; end if;
  update public.hockey_tournament_documents set title='Revised title',revision_note='Updated tie 18' where id=d2;
  refused:=false;
  begin update public.hockey_tournament_documents set storage_path=p1 where id=d2;
  exception when others then refused:=true; end;
  if not refused then raise exception 'Published binary was replaceable'; end if;
  refused:=false;
  begin insert into public.hockey_tournament_documents(id,season_id,title,storage_path,original_file_name,
    mime_type,file_extension,file_size,version_number)
    values(draft,s,'Wrong MIME',pd,'bad.png','application/pdf','png',100,3);
  exception when others then refused:=true; end;
  if not refused then raise exception 'Extension/MIME mismatch accepted'; end if;
  insert into public.hockey_tournament_documents(id,season_id,title,storage_path,original_file_name,
    mime_type,file_extension,file_size,version_number)
    values(draft,s,'Unpublished draft',pd,'draft.png','image/png','png',100,99);
  refused:=false;
  begin delete from public.hockey_tournament_documents where id=d2;
  exception when others then refused:=true; end;
  if not refused then raise exception 'Published history was deleted'; end if;
  delete from public.hockey_tournament_documents where id=draft;
  if exists(select 1 from public.hockey_tournament_documents where id=draft) then raise exception 'Draft deletion failed'; end if;
  result:=public.hockey_set_document_publication(d2,false);
  if result.is_published or not (select is_current from public.hockey_tournament_documents where id=d1) then
    raise exception 'Unpublish did not restore previous current version'; end if;
  refused:=false;
  begin delete from public.hockey_tournament_documents where id=d2;
  exception when others then refused:=true; end;
  if not refused then raise exception 'Ever-published history was deleted after unpublish'; end if;
  insert into public.hockey_tournament_documents(id,season_id,title,storage_path,original_file_name,
    mime_type,file_extension,file_size,version_number)
    values(draft,s,'Hidden draft',pd,'draft.png','image/png','png',100,99);
  insert into storage.objects(bucket_id,name) values('anjk-tournament-documents',pd);
end $$;
-- SQL-level RLS proof using an anonymous role: drafts and their private objects are hidden.
-- Real Supabase Storage signed URLs are exercised by the browser integration after deployment.
set local role anon;
do $$
begin
  if exists(select 1 from public.hockey_tournament_documents where title='Hidden draft') then
    raise exception 'Draft metadata leaked to anon'; end if;
  if not exists(select 1 from public.hockey_tournament_documents where title='Initial' and is_published) then
    raise exception 'Published history hidden from anon'; end if;
  if exists(select 1 from storage.objects where bucket_id='anjk-tournament-documents'
    and name like (select id::text||'/draw-ties/%/%.png' from public.hockey_seasons
      where slug like 'draw-test-%' order by created_at desc limit 1)) then
    raise exception 'Draft object leaked to anon'; end if;
end $$;
reset role;
rollback;
