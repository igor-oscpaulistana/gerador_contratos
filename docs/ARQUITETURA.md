# Arquitetura

```text
Navegador / GitHub Pages
        |
        +-- Supabase Auth (e-mail/senha)
        |
        +-- PostgreSQL / tabela contracts
                 |
                 +-- form_data (JSON)
                 +-- document_html (snapshot para reimpressão)
```

A aplicação permanece estática no frontend. O Supabase fornece autenticação e persistência. RLS limita a leitura/escrita ao usuário autenticado.
