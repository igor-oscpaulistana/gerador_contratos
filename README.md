# OSC Gerador de Contratos Sociais

Aplicação web independente para geração de contratos sociais de **Constituição** e **Alteração Contratual**, com histórico em Supabase.

## Funcionalidades atuais

- Login por e-mail e senha com Supabase Auth.
- Constituição de LTDA / LTDA Unipessoal.
- Alteração contratual com múltipla seleção:
  - endereço;
  - sócios;
  - capital social;
  - objeto social.
- Consolidação após a alteração.
- Capital em formato monetário brasileiro.
- Quotas tratadas como números inteiros.
- Máscaras de CPF, CNPJ e CEP.
- Histórico de contratos.
- Snapshot do documento no banco para reimpressão futura.
- Impressão / Salvar PDF pelo navegador.
- Download em `.doc` compatível com Microsoft Word.

## Estrutura

```text
osc-gerador-contratos/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── img/
│   └── js/
│       ├── app.js
│       ├── config.js
│       └── supabase-adapter.js
├── supabase/
│   ├── schema.sql
│   └── README.md
├── .github/workflows/pages.yml
└── README.md
```

## 1. Supabase

Siga `supabase/README.md`.

## 2. Teste local

Por segurança, navegadores podem restringir recursos quando o `index.html` é aberto diretamente. Prefira um servidor local:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## 3. GitHub

Crie um repositório e envie todo o conteúdo desta pasta. O workflow incluído publica o site no GitHub Pages.

No GitHub, em **Settings > Pages**, deixe a origem como **GitHub Actions**.

## 4. Observação sobre Word

A versão atual gera arquivo `.doc` compatível com Word diretamente no navegador. Para obter `.docx` nativo mantendo 100% do template original, a próxima etapa recomendada é uma função backend/Edge Function dedicada à geração do documento.

## 5. Importante

O frontend usa somente a chave pública/anon do Supabase. **Nunca** publique a chave `service_role`.


## Atualização v10

- Corpo dos contratos justificado na visualização, impressão/PDF e Word.
- Busca automática de endereço pelo CEP via ViaCEP.
- Preenchimento automático de logradouro, bairro, cidade e UF.
- Mantido preenchimento manual como contingência caso a consulta de CEP esteja indisponível.
- Sociedade Empresária Limitada passa a aceitar também quadro com um único sócio.


## Atualização v11 — Modelo Vila Salvi

- Constituição ajustada às 15 cláusulas da minuta Vila Salvi.
- Campo de sexo por sócio, com flexões masculino/feminino na redação.
- Campo de porte da empresa: ME ou EPP.
- Qualificação dos sócios com apenas o nome em negrito.
- Texto inicial de constituição atualizado para sócio único, com variação feminina e plural.
- Formatação Verdana 10 pt, linhas de 15/16 pt, recuos e margens aproximados da minuta.
- Quebras de página de Constituição antes das cláusulas 4, 10 e 15 para reproduzir a organização em 4 blocos do modelo.
- Paginação de impressão no padrão página/total + inicial do usuário autenticado, por exemplo: 1/4 C.
