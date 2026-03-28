# SEI Hub

<div align="center">
  <img src="./src/assets/sei-orange-logo.png" alt="Logo do SEI Hub" width="240" />
  <img src="./src/assets/ilum-logo.png" alt="Logo da ILUM" width="84" />

  <p>
    <strong>SEI · Sistema Estudantil Integrado</strong>
  </p>

  <p>
    Um hub estudantil para reunir comunicados, eventos, materiais, perfis e espacos institucionais
    da comunidade academica em uma experiencia unica.
  </p>
</div>

<p align="center">
  <img src="./src/assets/hero-ca.svg" alt="Banner do Centro Academico no SEI Hub" width="100%" />
</p>

## Visao Geral

O **SEI Hub** e uma aplicacao web voltada para a comunidade estudantil, com foco em centralizar
informacoes importantes do dia a dia academico em um unico lugar.

Hoje o projeto oferece uma base para:

- mural com postagens de diferentes tipos, como informativos, eventos, materiais, trabalhos e estagios;
- calendario mensal com eventos vinculados ao sistema;
- biblioteca visual de disciplinas com navegacao por areas;
- autenticacao e perfis de usuario via Supabase;
- espacos institucionais para Centro Academico e Atletica;
- area administrativa para moderacao e operacao interna.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Dados e autenticacao:** Supabase
- **Testes:** Vitest + Testing Library
- **E2E / automacao:** Playwright

## Como Executar

### Requisitos

- Node.js 20+ ou outra versao LTS recente
- npm 10+

### Instalacao

```bash
npm install
```

> Observacao: no estado atual do repositorio, prefira `npm install` em vez de `npm ci`, porque o
> `package-lock.json` ainda nao esta totalmente sincronizado com o `package.json`.

### Ambiente

O projeto usa variaveis do Supabase. O repositorio ja possui um arquivo `.env` com as chaves
necessarias para o ambiente atual.

Se voce quiser apontar para outro projeto Supabase, ajuste:

```env
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```

### Desenvolvimento local

```bash
npm run dev
```

Depois, abra o endereco exibido no terminal, normalmente:

```text
http://localhost:5173
```

## Build e Testes

### Gerar build de producao

```bash
npm run build
```

Os arquivos finais sao gerados em `dist/`.

### Rodar testes unitarios

```bash
npm test
```

### Rodar testes em modo watch

```bash
npm run test:watch
```

### Rodar lint

```bash
npm run lint
```

### Visualizar a build localmente

```bash
npm run preview
```

## Desenvolvimento do Projeto

### Estrutura principal

```text
src/
  assets/                  imagens e elementos visuais
  components/              componentes compartilhados e UI
  contexts/                contexto global, incluindo autenticacao
  integrations/supabase/   cliente e tipagens do Supabase
  pages/                   paginas principais da aplicacao
  test/                    setup e testes com Vitest
supabase/
  functions/               funcoes server-side
  migrations/              migracoes do banco
```

### Onde mexer em cada tipo de tarefa

- **Nova pagina:** `src/pages`
- **Novo componente reutilizavel:** `src/components`
- **Ajustes de autenticacao/sessao:** `src/contexts/AuthContext.tsx`
- **Integracao com backend:** `src/integrations/supabase`
- **Mudancas de banco:** `supabase/migrations`
- **Funcoes do Supabase:** `supabase/functions`

### Fluxo sugerido para contribuir

1. Instale as dependencias com `npm install`.
2. Rode `npm run dev` e valide a interface no navegador.
3. Antes de abrir PR, rode `npm test` e `npm run build`.
4. Se voce mexer em qualidade de codigo, rode tambem `npm run lint`.

### Estado atual que ajuda no onboarding

- O projeto ja sobe localmente, gera build e executa os testes existentes.
- Hoje a suite de testes ainda e pequena e inclui um exemplo basico em `src/test/example.test.ts`.
- O lint aponta erros ja existentes no codigo, entao isso pode aparecer mesmo sem alteracoes grandes.

## Rotas Principais

- `/` - mural principal
- `/biblioteca` - grafo de disciplinas e areas
- `/calendario` - eventos do mes
- `/centro-academico` - pagina institucional do CA
- `/atletica` - pagina institucional da Atletica
- `/login`, `/cadastro` - autenticacao
- `/perfil` - perfil do usuario
- `/admin` - painel administrativo

## Ideias para Proximos Passos

- ampliar a cobertura de testes para paginas e fluxos principais;
- tipar melhor as consultas ao Supabase e reduzir usos de `any`;
- documentar o modelo de dados e as entidades centrais;
- revisar os avisos e erros do lint para deixar o fluxo de contribuicao mais suave.

## Licenca

Definir a licenca do projeto.
