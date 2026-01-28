
create table if not exists public.loans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  loan_number text not null,
  borrower_name text not null,
  lender text not null,
  principal_amount numeric not null,
  interest_rate numeric not null,
  term_months integer not null,
  start_date date not null,
  monthly_payment numeric not null,
  status text default 'active',
  remaining_balance numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.loans enable row level security;

create policy "Users can view their own loans"
  on public.loans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own loans"
  on public.loans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own loans"
  on public.loans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own loans"
  on public.loans for delete
  using (auth.uid() = user_id);

-- Enable realtime
begin;
  do $$
  begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      create publication supabase_realtime;
    end if;
  end
  $$;
  alter publication supabase_realtime add table public.loans;
commit;
