-- Dados de exemplo para DESENVOLVIMENTO LOCAL (`supabase db reset`). Não é aplicado em produção.
-- Cria um grupo fictício para o site ter o que mostrar. Em produção, use docs/PRIMEIROS-PASSOS.md.

insert into public.groups (slug, name, short_name, institution, city, country, founded_year, default_lang, tagline, about, socials, urls)
values (
  'exemplo',
  'AWS Student Builder Group Exemplo',
  'Exemplo',
  'Universidade Exemplo',
  'Cidade Exemplo',
  'Brasil',
  2025,
  'pt',
  '{"pt": "Comunidade de estudantes que aprende e constrói em nuvem e IA com a AWS.", "en": "A student community learning and building on cloud and AI with AWS.", "es": "Comunidad de estudiantes que aprende y construye en la nube y con IA en AWS."}'::jsonb,
  '{"pt": "Este é um grupo de exemplo. O líder edita este texto em Dashboard > Grupo."}'::jsonb,
  '{"instagram": "https://www.instagram.com/", "linkedin": "https://www.linkedin.com/"}'::jsonb,
  '{}'::jsonb
)
on conflict (slug) do nothing;
