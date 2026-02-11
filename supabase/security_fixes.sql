-- SECURITY DEBT REPAYMENT & MISSING TABLES
-- Run this in Supabase SQL Editor

-- 1. Create SAVED_ITEMS Table
create table if not exists public.saved_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 2. RLS for Saved Items
alter table public.saved_items enable row level security;

create policy "Users can view own saved items" 
on public.saved_items for select 
using (auth.uid() = user_id);

create policy "Users can insert own saved items" 
on public.saved_items for insert 
with check (auth.uid() = user_id);

create policy "Users can delete own saved items" 
on public.saved_items for delete 
using (auth.uid() = user_id);


-- 3. SENSITIVE COLUMN PROTECTION (Prevent Privilege Escalation)

-- Create a generic function to prevent updates to specific columns
create or replace function public.prevent_sensitive_updates()
returns trigger as $$
begin
  -- IF the executing user is NOT a service role (superuser-like in Supabase context), check columns
  -- 'service_role' key has role 'service_role'. Authenticated users have 'authenticated'.
  if (auth.jwt() ->> 'role') = 'service_role' then
    return new;
  end if;

  -- Check specific columns based on table name
  if TG_TABLE_NAME = 'profiles' then
      if new.role is distinct from old.role then
          raise exception 'You are not authorized to update the "role" field.';
      end if;
  elsif TG_TABLE_NAME = 'vendors' then
      if new.is_verified is distinct from old.is_verified then
          raise exception 'You are not authorized to update the "is_verified" field.';
      end if;
      if new.is_featured is distinct from old.is_featured then
          raise exception 'You are not authorized to update the "is_featured" field.';
      end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Apply trigger to PROFILES
drop trigger if exists protect_profiles_sensitive_columns on public.profiles;
create trigger protect_profiles_sensitive_columns
before update on public.profiles
for each row execute procedure public.prevent_sensitive_updates();

-- Apply trigger to VENDORS
drop trigger if exists protect_vendors_sensitive_columns on public.vendors;
create trigger protect_vendors_sensitive_columns
before update on public.vendors
for each row execute procedure public.prevent_sensitive_updates();
