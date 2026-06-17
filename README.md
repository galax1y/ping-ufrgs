# KeyPET

Um sistema de controle de posse de chaves e visualização de status de sala, desenvolvido com Next.js 16.

## 🏗️ Arquitetura e Características

O projeto segue uma arquitetura integrando estilos de engenharia de software para garantir escalabilidade e manutenção.

### Estilos Arquiteturais Aplicados

- **Arquitetura em Camadas**: Separação clara entre Apresentação, Aplicação (Lógica), Domínio e Persistência.
- **JAMStack**: Adaptado para o paradigma de componentes React (View) e Server Actions (Controller).

## 📁 Estrutura do Projeto

```text
[Raiz]/
├── actions/      # Camada de Aplicação: Lógica de negócio e mutações (Server Actions)
│   ├── admin/    # Ações restritas a administradores
│   ├── assistant/# Ações para assistentes de sala
│   └── member/   # Ações para membros comuns
├── app/          # Camada de Apresentação: Roteamento (App Router) e Páginas
├── components/   # Componentes UI reutilizáveis (shadcn/ui)
├── database/     # Camada de Persistência: Esquemas Drizzle e migrações
├── lib/          # Camada de Domínio: Autenticação, guards e utilitários
├── public/       # Ativos estáticos (imagens, ícones)
├── scripts/      # Scripts de automação e seeding
└── e2e/          # Testes de ponta a ponta (Playwright)
```

## 🛠️ Tecnologias Principais

- **Framework**: Next.js 16 (React 19)
- **Estilização**: Tailwind CSS v4 + Radix UI (shadcn/ui)
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL
- **Segurança**: Jose (JWT) + BcryptJS
- **Validação**: Zod
- **Testes**: Playwright

## 🚀 Começando

### Pré-requisitos

- Node.js versão 24
- Arquivo `.env` com a variável `DATABASE_URL`

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone <repository-url>
cd ping-ufrgs
npm install
```

### Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 🗄️ Esquema do Banco de Dados

Para atualizar o esquema a partir do banco (Supabase/Postgres):

```bash
npx drizzle-kit pull
```

## 📚 Documentação Adicional

- [Next.js](https://nextjs.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [shadcn/ui](https://ui.shadcn.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Playwright](https://playwright.dev)
