-- PATCH: Protect approval_status from client-side updates
-- Run this in Supabase SQL Editor

create or replace function public.prevent_sensitive_updates()
returns trigger as $$
begin
  -- Allow service_role full access (admin actions use service role key)
  if (auth.jwt() ->> 'role') = 'service_role' then
    return new;
  end if;

  -- Protect sensitive columns on profiles
  if TG_TABLE_NAME = 'profiles' then
      if new.role is distinct from old.role then
          raise exception 'You are not authorized to update the "role" field.';
      end if;
      if new.approval_status is distinct from old.approval_status then
          raise exception 'You are not authorized to update the "approval_status" field.';
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

-- Re-apply trigger to PROFILES (function is replaced in-place, trigger already references it)
-- This is a no-op if the trigger already exists, but included for completeness
drop trigger if exists protect_profiles_sensitive_columns on public.profiles;
create trigger protect_profiles_sensitive_columns
before update on public.profiles
for each row execute procedure public.prevent_sensitive_updates();

-- Re-apply trigger to VENDORS
drop trigger if exists protect_vendors_sensitive_columns on public.vendors;
create trigger protect_vendors_sensitive_columns
before update on public.vendors
for each row execute procedure public.prevent_sensitive_updates();
