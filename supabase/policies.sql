-- CareCircle security rules (safe to run more than once)

-- 0. Remove any old policies so this file can be re-run
do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 1. Helper functions (security definer avoids "infinite recursion" errors)
create or replace function is_circle_member(circle uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from circle_members
    where circle_id = circle and user_id = auth.uid()
  );
$$;

create or replace function is_circle_admin(circle uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from circle_members
    where circle_id = circle and user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function shares_circle_with(other uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from circle_members a
    join circle_members b on a.circle_id = b.circle_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;

-- 2. Turn on Row Level Security for all 6 tables
alter table profiles enable row level security;
alter table care_circles enable row level security;
alter table circle_members enable row level security;
alter table appointments enable row level security;
alter table tasks enable row level security;
alter table activity_log enable row level security;

-- 3. profiles: read yourself and people in your circle, edit only yourself
create policy "read own and circle profiles" on profiles
  for select using (id = auth.uid() or shares_circle_with(id));
create policy "update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 4. care_circles: members can read their circle
create policy "members read circle" on care_circles
  for select using (is_circle_member(id));

-- 5. circle_members: read your own circle's members, only admins remove
create policy "read circle members" on circle_members
  for select using (user_id = auth.uid() or is_circle_member(circle_id));
create policy "admins remove members" on circle_members
  for delete using (is_circle_admin(circle_id));

-- 6. appointments: members read and add, admins delete
create policy "members read appointments" on appointments
  for select using (is_circle_member(circle_id));
create policy "members add appointments" on appointments
  for insert with check (is_circle_member(circle_id) and created_by = auth.uid());
create policy "admins delete appointments" on appointments
  for delete using (is_circle_admin(circle_id));

-- 7. tasks: members read and add, assignee or admin updates, admins delete
create policy "members read tasks" on tasks
  for select using (is_circle_member(circle_id));
create policy "members add tasks" on tasks
  for insert with check (is_circle_member(circle_id) and created_by = auth.uid());
create policy "assignee or admin updates tasks" on tasks
  for update
  using (is_circle_member(circle_id) and (is_circle_admin(circle_id) or assigned_to = auth.uid()))
  with check (is_circle_member(circle_id) and (is_circle_admin(circle_id) or assigned_to = auth.uid()));
create policy "admins delete tasks" on tasks
  for delete using (is_circle_admin(circle_id));

-- 8. activity_log: members read, members add their own entries
create policy "members read activity" on activity_log
  for select using (is_circle_member(circle_id));
create policy "members add activity" on activity_log
  for insert with check (is_circle_member(circle_id) and user_id = auth.uid());