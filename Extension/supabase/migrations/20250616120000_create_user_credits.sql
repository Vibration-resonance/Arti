-- Migration: Création de la table user_credits pour la gestion des crédits de signalement/vote
create table if not exists public.user_credits (
  user_id uuid primary key references public.users(id) on delete cascade,
  credits integer not null default 0,
  last_recharge timestamptz not null default now()
);
