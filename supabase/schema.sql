-- CareCircle database schema
-- Run this whole file once in Supabase -> SQL Editor

-- 1. TABLES

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table care_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  elder_name text not null,
  join_code text unique not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references care_circles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  unique (circle_id, user_id)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references care_circles(id) on delete cascade,
  title text not null,
  location text,
  appointment_at timestamptz not null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references care_circles(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references profiles(id),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_by uuid references profiles(id),
  completed_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references care_circles(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  details text,
  created_at timestamptz default now()
);

-- 2. FUNCTIONS

-- Create a circle: makes a random 6-character code and adds the caller as admin
create or replace function create_circle(circle_name text, elder text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in';
  end if;

  -- keep generating until the code is unique
  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from care_circles where join_code = new_code);
  end loop;

  insert into care_circles (name, elder_name, join_code, created_by)
  values (circle_name, elder, new_code, auth.uid())
  returning id into new_id;

  insert into circle_members (circle_id, user_id, role)
  values (new_id, auth.uid(), 'admin');

  return new_id;
end;
$$;

-- Join a circle with a code: adds the caller as a member
create or replace function join_circle(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  found_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in';
  end if;

  select id into found_id from care_circles where join_code = upper(trim(code));

  if found_id is null then
    raise exception 'Invalid join code. Please check and try again.';
  end if;

  insert into circle_members (circle_id, user_id, role)
  values (found_id, auth.uid(), 'member')
  on conflict (circle_id, user_id) do nothing;

  return found_id;
end;
$$;

-- 3. TRIGGER: create a profile automatically when someone signs up

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS policies come in Prompt 7.