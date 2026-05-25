create or replace function public.ensure_current_user_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles%rowtype;
  profile_count integer;
  assigned_role app_role;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into profile_count from public.profiles;
  assigned_role := case when profile_count = 0 then 'owner'::app_role else 'staff'::app_role end;

  insert into public.profiles (id, full_name, role)
  values (
    auth.uid(),
    coalesce(auth.jwt() ->> 'email', 'Studio user'),
    assigned_role
  )
  on conflict (id) do update
    set updated_at = now()
  returning * into current_profile;

  return current_profile;
end;
$$;

grant execute on function public.ensure_current_user_profile() to authenticated;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_count integer;
  assigned_role app_role;
begin
  select count(*) into profile_count from public.profiles;
  assigned_role := case when profile_count = 0 then 'owner'::app_role else 'staff'::app_role end;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, 'Studio user'),
    assigned_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
