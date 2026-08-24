# Configuração do Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor** e execute `schema.sql`.
3. Em **Authentication > Users**, crie o usuário inicial:
   - E-mail: `igor.borges@oscpaulistana.com.br`
   - Senha: `123456`
4. Em **Project Settings > API**, copie a URL e a chave **anon/publishable**.
5. Cole esses valores em `assets/js/config.js`.

## Segurança

- Nunca coloque a `service_role` key no frontend.
- A chave anon/publishable pode ser pública porque o acesso é protegido por RLS.
- As políticas deste projeto limitam cada usuário aos próprios contratos.

## Histórico

O banco salva tanto os dados estruturados (`form_data`) quanto o HTML final (`document_html`). Assim, contratos antigos podem ser reabertos e impressos a partir do snapshot gerado na época.
