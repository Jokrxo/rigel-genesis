
-- Enable replication for deferred tax tables to support realtime subscriptions
begin;
  -- Check if the publication exists, if not create it
  do $$
  begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      create publication supabase_realtime;
    end if;
  end
  $$;

  -- Add tables to the publication
  alter publication supabase_realtime add table public.deferred_tax_projects;
  alter publication supabase_realtime add table public.deferred_tax_categories;
  alter publication supabase_realtime add table public.tax_loss_carry_forwards;
  alter publication supabase_realtime add table public.deferred_tax_movements;
commit;
