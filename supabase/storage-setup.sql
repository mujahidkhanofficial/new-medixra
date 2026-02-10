-- 1. Create the 'products' bucket
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Allow Public Read Access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'products' );

-- 3. Allow Authenticated Users to Upload
create policy "Authenticated Updates"
on storage.objects for insert
with check (
  bucket_id = 'products'
  and auth.role() = 'authenticated'
);

-- 4. Allow Users to Update/Delete their own files
create policy "Users can Update Own Files"
on storage.objects for update
using (
  bucket_id = 'products'
  and auth.uid() = owner
);

create policy "Users can Delete Own Files"
on storage.objects for delete
using (
  bucket_id = 'products'
  and auth.uid() = owner
);