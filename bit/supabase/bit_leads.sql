-- Bit · tabla de leads del quiz de fundador.
-- Pégalo en el SQL Editor del proyecto de Supabase de Bit (no en otro proyecto).
create table if not exists public.bit_leads (
  id          bigint generated always as identity primary key,
  creado_en   timestamptz not null default now(),
  negocio     text not null check (char_length(negocio) between 1 and 120),
  nombre      text not null check (char_length(nombre) between 1 and 120),
  whatsapp    text not null check (whatsapp ~ '^[0-9]{10}$'),
  giro        text check (char_length(giro) <= 60),
  compania    text check (char_length(compania) <= 40),
  llamadas    text check (char_length(llamadas) <= 40),
  perdidas    text check (char_length(perdidas) <= 60),
  motivo      text check (char_length(motivo) <= 60),
  usa         text check (char_length(usa) <= 60),
  cuando      text check (char_length(cuando) <= 60),
  puntos      smallint check (puntos between 0 and 15),
  califica    boolean not null default false
);

-- La página solo puede insertar; nadie puede leer con la llave pública.
alter table public.bit_leads enable row level security;
drop policy if exists "quiz inserta" on public.bit_leads;
create policy "quiz inserta" on public.bit_leads
  for insert to anon with check (true);
revoke select, update, delete on public.bit_leads from anon, authenticated;
grant insert on public.bit_leads to anon;

-- Vista para revisar: los calificados primero.
create or replace view public.bit_leads_por_calificar
with (security_invoker = true) as
  select creado_en, negocio, nombre, whatsapp, giro, puntos, califica, cuando, perdidas
  from public.bit_leads
  order by califica desc, puntos desc, creado_en desc;
revoke all on public.bit_leads_por_calificar from anon, authenticated;
